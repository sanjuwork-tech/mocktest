import { desc, sql, eq } from "drizzle-orm";
import { requireDb } from "@/db/client";
import {
  attemptsTable,
  attemptResultsTable,
  testsTable,
  productsTable,
  ordersTable,
  usersTable,
  testVersionsTable,
} from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { apiError, json } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin(["admin", "reviewer"]);
    const db = requireDb();

    const [
      revenueByMonth,
      testPerformance,
      topProducts,
      studentActivity,
    ] = await Promise.all([
      db
        .select({
          month: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM')`,
          revenue: sql<number>`coalesce(sum(case when ${ordersTable.paymentStatus}='paid' then ${ordersTable.amountMinor} else 0 end),0)::int`,
          orders: sql<number>`count(*)::int`,
          paid: sql<number>`count(*) filter (where ${ordersTable.paymentStatus}='paid')::int`,
        })
        .from(ordersTable)
        .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`)
        .orderBy(desc(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`))
        .limit(12),

      db
        .select({
          testId: testsTable.id,
          testTitle: testsTable.title,
          productTitle: productsTable.title,
          attempts: sql<number>`count(${attemptsTable.id})::int`,
          completed: sql<number>`count(${attemptResultsTable.attemptId})::int`,
          avgScore: sql<number>`coalesce(avg(${attemptResultsTable.score}),0)::int`,
          avgMaxScore: sql<number>`coalesce(avg(${attemptResultsTable.maxScore}),0)::int`,
        })
        .from(testsTable)
        .innerJoin(productsTable, eq(productsTable.id, testsTable.productId))
        .leftJoin(
          testVersionsTable,
          eq(testVersionsTable.testId, testsTable.id),
        )
        .leftJoin(
          attemptsTable,
          eq(attemptsTable.testVersionId, testVersionsTable.id),
        )
        .leftJoin(
          attemptResultsTable,
          eq(attemptResultsTable.attemptId, attemptsTable.id),
        )
        .where(eq(testsTable.published, true))
        .groupBy(testsTable.id, testsTable.title, productsTable.title)
        .orderBy(desc(sql`count(${attemptsTable.id})`))
        .limit(20),

      db
        .select({
          productSlug: ordersTable.productSlug,
          orders: sql<number>`count(*)::int`,
          revenue: sql<number>`coalesce(sum(case when ${ordersTable.paymentStatus}='paid' then ${ordersTable.amountMinor} else 0 end),0)::int`,
        })
        .from(ordersTable)
        .groupBy(ordersTable.productSlug)
        .orderBy(desc(sql`count(*)`)),

      db
        .select({
          month: sql<string>`to_char(${attemptsTable.startedAt}, 'YYYY-MM')`,
          totalAttempts: sql<number>`count(*)::int`,
          uniqueStudents: sql<number>`count(distinct ${attemptsTable.userId})::int`,
        })
        .from(attemptsTable)
        .groupBy(sql`to_char(${attemptsTable.startedAt}, 'YYYY-MM')`)
        .orderBy(desc(sql`to_char(${attemptsTable.startedAt}, 'YYYY-MM')`))
        .limit(12),
    ]);

    return json({
      revenueByMonth: revenueByMonth.map((r) => ({
        ...r,
        revenue: r.revenue / 100,
      })),
      testPerformance: testPerformance.map((t) => ({
        ...t,
        avgPercent: t.avgMaxScore > 0 ? Math.round((t.avgScore / t.avgMaxScore) * 100) : 0,
      })),
      topProducts: topProducts.map((p) => ({
        ...p,
        revenue: p.revenue / 100,
      })),
      studentActivity,
    });
  } catch (e) {
    return apiError(e);
  }
}
