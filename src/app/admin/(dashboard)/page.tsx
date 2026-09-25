import { desc, isNull } from "drizzle-orm";
import { DashboardClient, type InventoryProduct } from "./dashboard-client";
import { db } from "@/db/client";
import { currentAdmin } from "@/server/auth";
import { productsTable } from "@/db/schema";

export default async function AdminDashboardPage() {
  const admin = await currentAdmin();
  let products: InventoryProduct[] = [];
  let state: "ready" | "unconfigured" | "unavailable" = db
    ? "ready"
    : "unconfigured";
  if (db) {
    try {
      products = await db
        .select({
          id: productsTable.id,
          slug: productsTable.slug,
          exam: productsTable.exam,
          title: productsTable.title,
          description: productsTable.description,
          price: productsTable.priceMinor,
          compareAtPrice: productsTable.compareAtPriceMinor,
          mockCount: productsTable.mockCount,
          published: productsTable.published,
          featured: productsTable.featured,
          salesEnabled: productsTable.salesEnabled,
        })
        .from(productsTable)
        .where(isNull(productsTable.archivedAt))
        .orderBy(desc(productsTable.createdAt));
      products = products.map((p) => ({
        ...p,
        price: p.price / 100,
        compareAtPrice: p.compareAtPrice / 100,
      }));
    } catch {
      state = "unavailable";
    }
  }
  return (
    <DashboardClient
      products={products}
      databaseState={state}
      role={admin?.role ?? "editor"}
    />
  );
}
