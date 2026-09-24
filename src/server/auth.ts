import "server-only";
import { and, eq, gt, isNull, sql, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { requireDb } from "@/db/client";
import {
  sessionsTable,
  usersTable,
  authRateLimitsTable,
  auditLogTable,
} from "@/db/schema";
import { ApiError } from "./http";
import {
  DUMMY_PASSWORD_HASH,
  isStaff,
  newSessionToken,
  normalizeEmail,
  tokenHash,
  verifyPassword,
  type AdminRole,
} from "./security";
export const ADMIN_COOKIE = "testdisha_session";
export const SESSION_SECONDS = 8 * 60 * 60;
export async function rateLimit(key: string, max: number, seconds: number) {
  const db = requireDb();
  const end = new Date(Date.now() + seconds * 1000);
  const [bucket] = await db
    .insert(authRateLimitsTable)
    .values({ key, count: 1, resetAt: end })
    .onConflictDoUpdate({
      target: authRateLimitsTable.key,
      set: {
        count: sql`case when ${authRateLimitsTable.resetAt} <= now() then 1 else ${authRateLimitsTable.count}+1 end`,
        resetAt: sql`case when ${authRateLimitsTable.resetAt} <= now() then ${end.toISOString()}::timestamptz else ${authRateLimitsTable.resetAt} end`,
      },
    })
    .returning();
  if (bucket.count > max)
    throw new ApiError(429, "Too many attempts. Wait before trying again.");
}
export async function login(email: string, password: string) {
  const db = requireDb();
  email = normalizeEmail(email);
  await rateLimit("login:global", 100, 60);
  await rateLimit("login:" + tokenHash(email), 5, 15 * 60);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  const matches = await verifyPassword(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );
  if (!user || !matches || !user.active || !isStaff(user.role)) {
    await db.insert(auditLogTable).values({
      action: "login.failed",
      entityType: "authentication",
      details: { accountHash: tokenHash(email) },
    });
    throw new ApiError(401, "Email or password is incorrect.");
  }
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await db.transaction(async (tx) => {
    // Recheck account state under a lock before issuing a session.
    const [current] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .for("update");
    if (
      !current?.active ||
      current.passwordHash !== user.passwordHash ||
      !isStaff(current.role)
    )
      throw new ApiError(401, "Email or password is incorrect.");
    await tx
      .insert(sessionsTable)
      .values({ userId: user.id, tokenHash: tokenHash(token), expiresAt });
    await tx
      .delete(authRateLimitsTable)
      .where(eq(authRateLimitsTable.key, "login:" + tokenHash(email)));
    await tx.insert(auditLogTable).values({
      actorId: user.id,
      action: "login.succeeded",
      entityType: "authentication",
    });
  });
  return { token, expiresAt };
}
export async function currentAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const [entry] = await requireDb()
    .select({
      sessionId: sessionsTable.id,
      expiresAt: sessionsTable.expiresAt,
      userId: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(
      and(
        eq(sessionsTable.tokenHash, tokenHash(token)),
        gt(sessionsTable.expiresAt, new Date()),
        isNull(sessionsTable.revokedAt),
        eq(usersTable.active, true),
      ),
    )
    .limit(1);
  return entry && isStaff(entry.role)
    ? { ...entry, role: entry.role as AdminRole }
    : null;
}
export async function requireAdmin(
  roles: AdminRole[] = ["admin", "reviewer", "editor"],
) {
  const user = await currentAdmin();
  if (!user) throw new ApiError(401, "Sign in to continue.");
  if (!roles.includes(user.role))
    throw new ApiError(403, "Your role does not permit this action.");
  return user;
}
export async function logout() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return;
  const db = requireDb();
  await db.transaction(async (tx) => {
    const [s] = await tx
      .update(sessionsTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessionsTable.tokenHash, tokenHash(token)),
          isNull(sessionsTable.revokedAt),
        ),
      )
      .returning();
    if (s)
      await tx.insert(auditLogTable).values({
        actorId: s.userId,
        action: "session.revoked",
        entityType: "session",
        entityId: s.id,
      });
  });
}
export async function recentAudit() {
  return requireDb()
    .select({
      id: auditLogTable.id,
      action: auditLogTable.action,
      entityType: auditLogTable.entityType,
      entityId: auditLogTable.entityId,
      createdAt: auditLogTable.createdAt,
      actorEmail: usersTable.email,
    })
    .from(auditLogTable)
    .leftJoin(usersTable, eq(usersTable.id, auditLogTable.actorId))
    .orderBy(desc(auditLogTable.createdAt))
    .limit(50);
}

// ──────────────────────────────────────────────────
// Student authentication (Phase 4)
// ──────────────────────────────────────────────────

export const STUDENT_COOKIE = "testdisha_student";
export const STUDENT_SESSION_SECONDS = 24 * 60 * 60; // 24 hours

export async function studentLogin(email: string, password: string) {
  const db = requireDb();
  email = normalizeEmail(email);
  await rateLimit("login:global", 100, 60);
  await rateLimit("login:student:" + tokenHash(email), 5, 15 * 60);

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  const matches = await verifyPassword(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!user || !matches || !user.active || user.role !== "student") {
    await db.insert(auditLogTable).values({
      action: "student.login.failed",
      entityType: "authentication",
      details: { accountHash: tokenHash(email) },
    });
    throw new ApiError(401, "Email or password is incorrect.");
  }

  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + STUDENT_SESSION_SECONDS * 1000);
  await db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .for("update");
    if (!current?.active || current.passwordHash !== user.passwordHash || current.role !== "student")
      throw new ApiError(401, "Email or password is incorrect.");
    await tx
      .insert(sessionsTable)
      .values({ userId: user.id, tokenHash: tokenHash(token), expiresAt });
    await tx
      .delete(authRateLimitsTable)
      .where(eq(authRateLimitsTable.key, "login:student:" + tokenHash(email)));
    await tx.insert(auditLogTable).values({
      actorId: user.id,
      action: "student.login.succeeded",
      entityType: "authentication",
    });
  });
  return { token, expiresAt, userId: user.id, name: user.name, email: user.email };
}

export async function currentStudent() {
  const token = (await cookies()).get(STUDENT_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const [entry] = await requireDb()
    .select({
      sessionId: sessionsTable.id,
      expiresAt: sessionsTable.expiresAt,
      userId: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
    .where(
      and(
        eq(sessionsTable.tokenHash, tokenHash(token)),
        gt(sessionsTable.expiresAt, new Date()),
        isNull(sessionsTable.revokedAt),
        eq(usersTable.active, true),
      ),
    )
    .limit(1);
  return entry && entry.role === "student" ? entry : null;
}

export async function requireStudent() {
  const user = await currentStudent();
  if (!user) throw new ApiError(401, "Sign in to continue.");
  return user;
}

export async function studentLogout() {
  const token = (await cookies()).get(STUDENT_COOKIE)?.value;
  if (!token) return;
  const db = requireDb();
  await db.transaction(async (tx) => {
    const [s] = await tx
      .update(sessionsTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessionsTable.tokenHash, tokenHash(token)),
          isNull(sessionsTable.revokedAt),
        ),
      )
      .returning();
    if (s)
      await tx.insert(auditLogTable).values({
        actorId: s.userId,
        action: "student.session.revoked",
        entityType: "session",
        entityId: s.id,
      });
  });
}
