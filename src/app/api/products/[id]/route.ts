import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { productsTable, auditLogTable } from "@/db/schema";
import { productPatch, saveProduct } from "@/server/products";
import { requireAdmin } from "@/server/auth";
import {
  apiError,
  ApiError,
  json,
  readJson,
  requireOrigin,
} from "@/server/http";
export const runtime = "nodejs";
async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    throw new ApiError(400, "Invalid series ID.");
  return id;
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireOrigin(request);
    const actor = await requireAdmin();
    const id = await parseId(params);
    const p = productPatch.safeParse(await readJson(request));
    if (!p.success)
      throw new ApiError(400, "Check the series fields and try again.");
    return json(await saveProduct(actor, p.data, id));
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireOrigin(request);
    const actor = await requireAdmin(["admin"]);
    const id = await parseId(params);
    await requireDb().transaction(async (tx) => {
      const [p] = await tx
        .update(productsTable)
        .set({
          archivedAt: new Date(),
          published: false,
          salesEnabled: false,
          updatedAt: new Date(),
        })
        .where(eq(productsTable.id, id))
        .returning();
      if (!p) throw new ApiError(404, "Series not found.");
      await tx
        .insert(auditLogTable)
        .values({
          actorId: actor.userId,
          action: "product.archived",
          entityType: "product",
          entityId: id,
        });
    });
    return json({ archived: true, id });
  } catch (e) {
    return apiError(e);
  }
}
