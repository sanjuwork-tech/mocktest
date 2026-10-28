import { randomUUID } from "node:crypto";
import { rateLimit, startStudentSession } from "@/server/auth";
import { apiError, ApiError, json, requireOrigin } from "@/server/http";
import { guestLoginEnabled } from "@/server/guest";
import { tokenHash } from "@/server/security";
import { requireDb } from "@/db/client";
import { auditLogTable, usersTable } from "@/db/schema";

export const runtime = "nodejs";

/** POST /api/auth/guest — create a temporary student account and sign it in. */
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    if (!guestLoginEnabled()) throw new ApiError(404, "Guest access is not available.");

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await rateLimit("guest:" + tokenHash(ip), 10, 60 * 60);

    const db = requireDb();
    const [user] = await db
      .insert(usersTable)
      .values({
        // .invalid is a reserved TLD, so a guest address can never receive mail or collide with a real one.
        email: `guest-${randomUUID()}@guest.ourmocks.invalid`,
        name: "Guest student",
        provider: "guest",
        role: "student",
        active: true,
      })
      .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email });
    await db.insert(auditLogTable).values({ actorId: user.id, action: "student.guest_created", entityType: "user", entityId: user.id });
    await startStudentSession(user.id);
    return json({ ok: true, user }, 201);
  } catch (e) {
    return apiError(e);
  }
}
