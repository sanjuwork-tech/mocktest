import "server-only";
import { and, eq, gt, isNull, sql, or } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { entitlementsTable, productsTable, auditLogTable } from "@/db/schema";
import { ApiError } from "./http";

const DEFAULT_TRIAL_DAYS = 7;

/**
 * Checks if a user has an active entitlement for a given product.
 * Returns the entitlement if found, null otherwise.
 */
export async function checkEntitlement(userId: string, productId: string) {
  const db = requireDb();
  const now = new Date();

  const [entitlement] = await db
    .select({
      id: entitlementsTable.id,
      source: entitlementsTable.source,
      startsAt: entitlementsTable.startsAt,
      expiresAt: entitlementsTable.expiresAt,
    })
    .from(entitlementsTable)
    .where(
      and(
        eq(entitlementsTable.userId, userId),
        eq(entitlementsTable.productId, productId),
        isNull(entitlementsTable.revokedAt),
        // startsAt must be in the past
        sql`${entitlementsTable.startsAt} <= ${now.toISOString()}::timestamptz`,
        // expiresAt must be null (unlimited) or in the future
        or(
          isNull(entitlementsTable.expiresAt),
          gt(entitlementsTable.expiresAt, now),
        ),
      ),
    )
    .limit(1);

  return entitlement ?? null;
}

/**
 * Requires an active entitlement for a user to access a product.
 * Throws 403 if no active entitlement exists.
 */
export async function requireEntitlement(userId: string, productId: string) {
  const entitlement = await checkEntitlement(userId, productId);
  if (!entitlement) {
    throw new ApiError(403, "You do not have access to this test series. Please purchase or request trial access.");
  }
  return entitlement;
}

/**
 * Grants a trial entitlement to a student.
 * Returns the created entitlement.
 */
export async function grantTrialEntitlement(
  userId: string,
  productId: string,
  durationDays: number = DEFAULT_TRIAL_DAYS,
) {
  const db = requireDb();

  // Verify product exists
  const [product] = await db
    .select({ id: productsTable.id, title: productsTable.title })
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) throw new ApiError(404, "Product not found.");

  // Check for existing active entitlement
  const existing = await checkEntitlement(userId, productId);
  if (existing) {
    throw new ApiError(409, "User already has an active entitlement for this product.");
  }

  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const [entitlement] = await db
    .insert(entitlementsTable)
    .values({
      userId,
      productId,
      source: "trial",
      startsAt,
      expiresAt,
    })
    .returning();

  await db.insert(auditLogTable).values({
    actorId: userId,
    action: "entitlement.trial.granted",
    entityType: "entitlement",
    entityId: entitlement.id,
    details: { productId, durationDays, expiresAt: expiresAt.toISOString() },
  });

  return entitlement;
}

/**
 * Grants an admin-assigned entitlement (no expiry unless specified).
 */
export async function grantAdminEntitlement(
  userId: string,
  productId: string,
  adminId: string,
  durationDays?: number,
) {
  const db = requireDb();

  const [product] = await db
    .select({ id: productsTable.id, title: productsTable.title })
    .from(productsTable)
    .where(eq(productsTable.id, productId));

  if (!product) throw new ApiError(404, "Product not found.");

  const existing = await checkEntitlement(userId, productId);
  if (existing) {
    throw new ApiError(409, "User already has an active entitlement for this product.");
  }

  const startsAt = new Date();
  const expiresAt = durationDays
    ? new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  const [entitlement] = await db
    .insert(entitlementsTable)
    .values({
      userId,
      productId,
      source: "admin",
      startsAt,
      expiresAt,
    })
    .returning();

  await db.insert(auditLogTable).values({
    actorId: adminId,
    action: "entitlement.admin.granted",
    entityType: "entitlement",
    entityId: entitlement.id,
    details: {
      userId,
      productId,
      durationDays: durationDays ?? "unlimited",
      expiresAt: expiresAt?.toISOString() ?? null,
    },
  });

  return entitlement;
}

/**
 * Grants a paid entitlement for a completed order.
 */

export async function grantPaidEntitlement(
  userId: string,
  productId: string,
  orderId: string,
  txClient?: any,
) {
  const dbClient = txClient ?? requireDb();
  // Check for existing active entitlement (using outer db since it's just a read)
  const existing = await checkEntitlement(userId, productId);
  if (existing) {
    return existing; // already exists
  }

  const now = new Date();
  // Paid entitlements typically last 1 year (365 days)
  const durationDays = 365;
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const [entitlement] = await dbClient
    .insert(entitlementsTable)
    .values({
      userId,
      productId,
      orderId,
      source: "purchase",
      startsAt: now,
      expiresAt,
    })
    .returning();

  await dbClient.insert(auditLogTable).values({
    actorId: userId, // System / webhook
    action: "entitlement.purchase.granted",
    entityType: "entitlement",
    entityId: entitlement.id,
    details: {
      userId,
      productId,
      orderId,
      durationDays,
    },
  });

  return entitlement;
}

/**
 * Revokes an entitlement by ID with audit trail.
 */
export async function revokeEntitlement(entitlementId: string, adminId: string) {
  const db = requireDb();

  const [updated] = await db
    .update(entitlementsTable)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(entitlementsTable.id, entitlementId),
        isNull(entitlementsTable.revokedAt),
      ),
    )
    .returning();

  if (!updated) throw new ApiError(404, "Entitlement not found or already revoked.");

  await db.insert(auditLogTable).values({
    actorId: adminId,
    action: "entitlement.revoked",
    entityType: "entitlement",
    entityId: entitlementId,
    details: { userId: updated.userId, productId: updated.productId },
  });

  return updated;
}
