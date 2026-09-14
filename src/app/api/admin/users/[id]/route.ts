import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { requireDb } from "@/db/client";
import { usersTable, sessionsTable, auditLogTable } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
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
    active: z.boolean().optional(),
    role: z.enum(["admin", "reviewer", "editor"]).optional(),
    revokeSessions: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0);
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireOrigin(request);
    const actor = await requireAdmin(["admin"]);
    const { id } = await params;
    if (!z.uuid().safeParse(id).success)
      throw new ApiError(400, "Invalid user ID.");
    const parsed = input.safeParse(await readJson(request, 2048));
    if (!parsed.success) throw new ApiError(400, "Invalid account update.");
    if (
      id === actor.userId &&
      (parsed.data.active === false ||
        (parsed.data.role && parsed.data.role !== "admin"))
    )
      throw new ApiError(
        409,
        "You cannot disable or demote your own admin account.",
      );
    await requireDb().transaction(async (tx) => {
      const admins = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.role, "admin"))
        .orderBy(usersTable.id)
        .for("update");
      if (!admins.some((u) => u.id === actor.userId && u.active))
        throw new ApiError(403, "Admin access changed. Sign in again.");
      const [target] = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .for("update");
      if (!target) throw new ApiError(404, "User not found.");
      const { revokeSessions, ...changes } = parsed.data;
      if (Object.keys(changes).length)
        await tx
          .update(usersTable)
          .set({ ...changes, updatedAt: new Date() })
          .where(eq(usersTable.id, id));
      if (revokeSessions || parsed.data.active === false || parsed.data.role)
        await tx
          .update(sessionsTable)
          .set({ revokedAt: new Date() })
          .where(
            and(eq(sessionsTable.userId, id), isNull(sessionsTable.revokedAt)),
          );
      await tx
        .insert(auditLogTable)
        .values({
          actorId: actor.userId,
          action: revokeSessions ? "user.sessions_revoked" : "user.updated",
          entityType: "user",
          entityId: id,
          details: changes,
        });
    });
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
