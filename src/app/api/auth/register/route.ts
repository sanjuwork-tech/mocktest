import { z } from "zod";
import { eq } from "drizzle-orm";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { currentStudent, rateLimit, startStudentSession } from "@/server/auth";
import { isGuestEmail } from "@/lib/guest";
import { requireDb } from "@/db/client";
import { usersTable, auditLogTable, sessionsTable } from "@/db/schema";
import { hashPassword, normalizeEmail, tokenHash } from "@/server/security";
import { consentRecord, signupConsentSchema } from "@/app/privacy/legal";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Please provide a valid email address.").max(200),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  consent: signupConsentSchema,
});

export async function POST(request: Request) {
  try {
    requireOrigin(request);

    const body = await readJson(request, 16384);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const consentIssue = parsed.error.issues.find((issue) => issue.path[0] === "consent");
      return json({
        error: consentIssue?.message ?? "Invalid registration data.",
        details: parsed.error.issues,
      }, 400);
    }

    const db = requireDb();
    const email = normalizeEmail(parsed.data.email);
    // DPDP Act 2023 s.6 and s.9: record who consented, on what basis and to which policy version, before the
    // account exists. The users table has no consent columns, so the record lives in this sign-up's audit entry.
    let consent: ReturnType<typeof consentRecord>;
    try {
      consent = consentRecord(parsed.data.consent, email);
    } catch (e) {
      throw new ApiError(400, e instanceof Error ? e.message : "Invalid consent details.");
    }

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
    const passwordHash = await hashPassword(parsed.data.password, 8);

    // A signed-in guest becomes this account in place, so the tests they already took stay theirs.
    const current = await currentStudent();
    const guestId = current && isGuestEmail(current.email) ? current.userId : null;
    const values = { name: parsed.data.name.trim(), email, passwordHash, provider: "credentials" };
    const returning = { id: usersTable.id, name: usersTable.name, email: usersTable.email };
    // One transaction, so an account never exists without its consent record.
    const user = await db.transaction(async (tx) => {
      const [created] = guestId
        ? await tx.update(usersTable).set({ ...values, updatedAt: new Date() }).where(eq(usersTable.id, guestId)).returning(returning)
        : await tx.insert(usersTable).values({ ...values, role: "student" }).returning(returning);
      await tx.insert(auditLogTable).values({
        actorId: created.id,
        action: guestId ? "student.guest_upgraded" : "student.registered",
        entityType: "user",
        entityId: created.id,
        details: { consent },
      });
      return created;
    });

    // Replace the guest's session token now that the account has a password.
    if (guestId && current) await db.update(sessionsTable).set({ revokedAt: new Date() }).where(eq(sessionsTable.id, current.sessionId));
    await startStudentSession(user.id);

    return json({ ok: true, user: { id: user.id, name: user.name, email: user.email } }, 201);
  } catch (e) {
    return apiError(e);
  }
}
