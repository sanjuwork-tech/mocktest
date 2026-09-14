import { desc } from "drizzle-orm";
import { z } from "zod";
import { requireDb } from "@/db/client";
import { usersTable, auditLogTable } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { hashPassword, normalizeEmail } from "@/server/security";
import {
  apiError,
  ApiError,
  json,
  readJson,
  requireOrigin,
} from "@/server/http";
export const runtime = "nodejs";
const input = z
  .object({
    email: z.email().max(254),
    name: z.string().trim().min(2).max(100),
    role: z.enum(["admin", "reviewer", "editor"]),
    password: z.string().min(12).max(128),
  })
  .strict();
export async function GET() {
  try {
    await requireAdmin(["admin"]);
    return json({
      users: await requireDb()
        .select({
          id: usersTable.id,
          email: usersTable.email,
          name: usersTable.name,
          role: usersTable.role,
          active: usersTable.active,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt)),
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const actor = await requireAdmin(["admin"]);
    const parsed = input.safeParse(await readJson(request, 4096));
    if (!parsed.success)
      throw new ApiError(
        400,
        "Use a valid email, name, staff role and a 12–128 character password.",
      );
    const { password, ...data } = parsed.data;
    const passwordHash = await hashPassword(password);
    const user = await requireDb().transaction(async (tx) => {
      const [created] = await tx
        .insert(usersTable)
        .values({ ...data, email: normalizeEmail(data.email), passwordHash })
        .returning({
          id: usersTable.id,
          email: usersTable.email,
          name: usersTable.name,
          role: usersTable.role,
          active: usersTable.active,
        });
      await tx
        .insert(auditLogTable)
        .values({
          actorId: actor.userId,
          action: "user.created",
          entityType: "user",
          entityId: created.id,
          details: { role: created.role },
        });
      return created;
    });
    return json({ user }, 201);
  } catch (e) {
    return apiError(e);
  }
}
