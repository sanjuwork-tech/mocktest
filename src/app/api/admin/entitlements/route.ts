import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { entitlementsTable, usersTable, productsTable } from "@/db/schema";
import { grantAdminEntitlement, grantTrialEntitlement, revokeEntitlement } from "@/server/entitlements";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireOrigin(request);
    await requireAdmin(["admin"]);

    const db = requireDb();
    const url = new URL(request.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 200);
    const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);

    const entitlements = await db
      .select({
        id: entitlementsTable.id,
        userId: entitlementsTable.userId,
        productId: entitlementsTable.productId,
        source: entitlementsTable.source,
        startsAt: entitlementsTable.startsAt,
        expiresAt: entitlementsTable.expiresAt,
        revokedAt: entitlementsTable.revokedAt,
        createdAt: entitlementsTable.createdAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
        productTitle: productsTable.title,
      })
      .from(entitlementsTable)
      .innerJoin(usersTable, eq(entitlementsTable.userId, usersTable.id))
      .innerJoin(productsTable, eq(entitlementsTable.productId, productsTable.id))
      .orderBy(desc(entitlementsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return json({ entitlements, count: entitlements.length, limit, offset });
  } catch (e) {
    return apiError(e);
  }
}

const grantSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  source: z.enum(["trial", "admin"]),
  durationDays: z.number().int().min(1).max(365).optional(),
});

export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["admin"]);

    const body = await readJson(request, 16384);
    const parsed = grantSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Invalid entitlement data.", details: parsed.error.issues }, 400);
    }

    const { userId, productId, source, durationDays } = parsed.data;

    let entitlement;
    if (source === "trial") {
      entitlement = await grantTrialEntitlement(userId, productId, durationDays ?? 7);
    } else {
      entitlement = await grantAdminEntitlement(userId, productId, admin.userId, durationDays);
    }

    return json({ ok: true, entitlement }, 201);
  } catch (e) {
    return apiError(e);
  }
}

const revokeSchema = z.object({
  entitlementId: z.string().uuid(),
});

export async function DELETE(request: Request) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["admin"]);

    const body = await readJson(request, 16384);
    const parsed = revokeSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Invalid revocation data." }, 400);
    }

    const revoked = await revokeEntitlement(parsed.data.entitlementId, admin.userId);
    return json({ ok: true, revoked });
  } catch (e) {
    return apiError(e);
  }
}
