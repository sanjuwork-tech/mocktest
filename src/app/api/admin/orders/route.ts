import { desc, eq, sql, and, gte, lte } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { ordersTable, productsTable, usersTable } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { apiError, json } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(["admin", "reviewer"]);
    const db = requireDb();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const productSlug = url.searchParams.get("product");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const search = url.searchParams.get("q")?.trim().toLowerCase();
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = 50;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(ordersTable.paymentStatus, status));
    if (productSlug) conditions.push(eq(ordersTable.productSlug, productSlug));
    if (from) conditions.push(gte(ordersTable.createdAt, new Date(from)));
    if (to) conditions.push(lte(ordersTable.createdAt, new Date(to)));
    if (search) {
      conditions.push(
        sql`(lower(${ordersTable.customerName}) like ${"%" + search + "%"} or lower(${ordersTable.email}) like ${"%" + search + "%"})`,
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [orders, [{ count }], [summary]] = await Promise.all([
      db
        .select({
          id: ordersTable.id,
          customerName: ordersTable.customerName,
          email: ordersTable.email,
          phone: ordersTable.phone,
          productSlug: ordersTable.productSlug,
          amountMinor: ordersTable.amountMinor,
          paymentStatus: ordersTable.paymentStatus,
          paymentReference: ordersTable.paymentReference,
          createdAt: ordersTable.createdAt,
        })
        .from(ordersTable)
        .where(where)
        .orderBy(desc(ordersTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(ordersTable)
        .where(where),
      db
        .select({
          totalRevenue: sql<number>`coalesce(sum(case when ${ordersTable.paymentStatus}='paid' then ${ordersTable.amountMinor} else 0 end),0)::int`,
          totalOrders: sql<number>`count(*)::int`,
          paidOrders: sql<number>`count(*) filter (where ${ordersTable.paymentStatus}='paid')::int`,
          pendingOrders: sql<number>`count(*) filter (where ${ordersTable.paymentStatus}='pending')::int`,
          todayOrders: sql<number>`count(*) filter (where ${ordersTable.createdAt}::date = current_date)::int`,
          todayRevenue: sql<number>`coalesce(sum(case when ${ordersTable.paymentStatus}='paid' and ${ordersTable.createdAt}::date = current_date then ${ordersTable.amountMinor} else 0 end),0)::int`,
        })
        .from(ordersTable),
    ]);

    return json({
      orders: orders.map((o) => ({
        ...o,
        amount: o.amountMinor / 100,
      })),
      pagination: { page, limit, total: count },
      summary: {
        totalRevenue: summary.totalRevenue / 100,
        totalOrders: summary.totalOrders,
        paidOrders: summary.paidOrders,
        pendingOrders: summary.pendingOrders,
        todayOrders: summary.todayOrders,
        todayRevenue: summary.todayRevenue / 100,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
