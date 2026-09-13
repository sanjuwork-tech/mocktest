import { desc } from "drizzle-orm";
import { DashboardClient, type InventoryProduct } from "./dashboard-client";
import { db } from "@/db/client";
import { productsTable } from "@/db/schema";

export default async function AdminDashboardPage() {
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
          price: productsTable.price,
          compareAtPrice: productsTable.compareAtPrice,
          mockCount: productsTable.mockCount,
          published: productsTable.published,
          featured: productsTable.featured,
        })
        .from(productsTable)
        .orderBy(desc(productsTable.createdAt));
    } catch {
      state = "unavailable";
    }
  }
  return <DashboardClient products={products} databaseState={state} />;
}
