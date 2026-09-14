import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, requireDb } from "@/db/client";
import { products as seedProducts, type Product } from "@/data/catalog";
import { productsTable, auditLogTable } from "@/db/schema";
import { ApiError } from "./http";
import { canPublish, rupeesToMinor, type AdminRole } from "./security";
export const productInput = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .min(2)
      .max(100),
    exam: z.string().min(2).max(100),
    title: z.string().trim().min(4).max(200),
    description: z.string().trim().min(20).max(3000),
    price: z
      .number()
      .min(0)
      .max(1000000)
      .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-7),
    compareAtPrice: z
      .number()
      .min(0)
      .max(1000000)
      .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-7),
    mockCount: z.number().int().min(0).max(10000),
    published: z.boolean(),
    featured: z.boolean(),
  })
  .strict();
export const productPatch = productInput
  .omit({ slug: true, exam: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0);
type Row = typeof productsTable.$inferSelect;
export function toPublicProduct(row: Row): Product {
  const seed = seedProducts.find((p) => p.slug === row.slug);
  const d = row.details;
  const text = (key: string, fallback: string) =>
    typeof d[key] === "string" ? (d[key] as string) : fallback;
  return {
    id: row.id,
    slug: row.slug,
    shortName: row.exam,
    title: row.title,
    description: row.description,
    price: row.priceMinor / 100,
    compareAtPrice: row.compareAtPriceMinor / 100,
    mocks: row.mockCount,
    students: "",
    subtitle: text(
      "subtitle",
      seed?.subtitle ?? "Focused preparation for your next chapter.",
    ),
    pattern: text("pattern", seed?.pattern ?? row.exam),
    features: Array.isArray(d.features)
      ? d.features.filter((x): x is string => typeof x === "string")
      : (seed?.features ?? []),
    keywords: [],
    color: text("color", seed?.color ?? "#1F5EFF"),
    accent: text("accent", seed?.accent ?? "#B8FF34"),
  };
}
export async function publicCatalog() {
  if (!db) {
    if (process.env.NODE_ENV === "production")
      throw new Error("Database unavailable");
    return seedProducts;
  }
  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(eq(productsTable.published, true), isNull(productsTable.archivedAt)),
    )
    .orderBy(desc(productsTable.createdAt));
  return rows.map(toPublicProduct);
}
export async function saveProduct(
  actor: { userId: string; role: AdminRole },
  input: z.infer<typeof productInput> | z.infer<typeof productPatch>,
  id?: string,
) {
  return requireDb().transaction(async (tx) => {
    const existing = id
      ? (
          await tx
            .select()
            .from(productsTable)
            .where(eq(productsTable.id, id))
            .for("update")
        )[0]
      : null;
    if (id && (!existing || existing.archivedAt))
      throw new ApiError(404, "Series not found.");
    if (!canPublish(actor.role) && (input.published || existing?.published))
      throw new ApiError(
        403,
        "Only a reviewer or admin can publish or change a published series.",
      );
    const priceMinor =
      input.price === undefined
        ? existing?.priceMinor
        : rupeesToMinor(input.price);
    const compareAtPriceMinor =
      input.compareAtPrice === undefined
        ? existing?.compareAtPriceMinor
        : rupeesToMinor(input.compareAtPrice);
    if (
      priceMinor === undefined ||
      compareAtPriceMinor === undefined ||
      compareAtPriceMinor < priceMinor
    )
      throw new ApiError(400, "Compare-at price must be at least the price.");
    const {
      price: ignoredPrice,
      compareAtPrice: ignoredCompare,
      ...fields
    } = input;
    void ignoredPrice;
    void ignoredCompare;
    const [saved] = existing
      ? await tx
          .update(productsTable)
          .set({
            ...fields,
            priceMinor,
            compareAtPriceMinor,
            updatedAt: new Date(),
          })
          .where(eq(productsTable.id, existing.id))
          .returning()
      : await tx
          .insert(productsTable)
          .values({
            ...fields,
            slug: (input as z.infer<typeof productInput>).slug,
            exam: (input as z.infer<typeof productInput>).exam,
            title: input.title!,
            description: input.description!,
            mockCount: input.mockCount!,
            priceMinor,
            compareAtPriceMinor,
          })
          .returning();
    await tx.insert(auditLogTable).values({
      actorId: actor.userId,
      action: existing ? "product.updated" : "product.created",
      entityType: "product",
      entityId: saved.id,
      details: {
        published: saved.published,
        priceMinor: saved.priceMinor,
        currency: saved.currency,
      },
    });
    return {
      ...saved,
      price: saved.priceMinor / 100,
      compareAtPrice: saved.compareAtPriceMinor / 100,
    };
  });
}
