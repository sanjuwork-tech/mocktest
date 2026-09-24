import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { rateLimit } from "@/server/auth";
import { requireDb } from "@/db/client";
import { usersTable, auditLogTable } from "@/db/schema";
import { hashPassword, normalizeEmail, tokenHash } from "@/server/security";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Please provide a valid email address.").max(200),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export async function POST(request: Request) {
  try {
    requireOrigin(request);

    const body = await readJson(request, 16384);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return json({
        error: "Invalid registration data.",
        details: parsed.error.issues,
      }, 400);
    }

    const db = requireDb();
    const email = normalizeEmail(parsed.data.email);

    // Rate limit registration
    await rateLimit("register:global", 20, 60);
    await rateLimit("register:" + tokenHash(email), 3, 15 * 60);

    // Check for duplicate email
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    // Hash password and create user
    const passwordHash = await hashPassword(parsed.data.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        name: parsed.data.name.trim(),
        email,
        passwordHash,
        role: "student",
        provider: "credentials",
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
      });

    await db.insert(auditLogTable).values({
      actorId: user.id,
      action: "student.registered",
      entityType: "user",
      entityId: user.id,
    });

    return json({ ok: true, message: "Account created successfully." }, 201);
  } catch (e) {
    return apiError(e);
  }
}
