import { NextResponse } from "next/server";
import { currentStudent } from "@/server/student-auth";
import { requireDb } from "@/db/client";
import { entitlementsTable, productsTable, testsTable, testVersionsTable } from "@/db/schema";
import { eq, and, isNull, sql, inArray, isNotNull } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const db = requireDb();

  // 1. Get all active entitlements
  const entitlements = await db
    .select({
      productId: entitlementsTable.productId,
    })
    .from(entitlementsTable)
    .where(
      and(
        eq(entitlementsTable.userId, student.id),
        isNull(entitlementsTable.revokedAt),
        sql`${entitlementsTable.startsAt} <= ${now.toISOString()}::timestamptz`,
        sql`(${entitlementsTable.expiresAt} IS NULL OR ${entitlementsTable.expiresAt} > ${now.toISOString()}::timestamptz)`
      )
    );

  const productIds = entitlements.map((e) => e.productId);
  if (productIds.length === 0) {
    return NextResponse.json({ tests: [] });
  }

  // 2. Fetch all published tests for these products
  const tests = await db
    .select({
      testId: testsTable.id,
      testTitle: testsTable.title,
      durationMinutes: testsTable.durationMinutes,
      totalMarks: testsTable.totalMarks,
      productTitle: productsTable.title,
      versionId: testVersionsTable.id,
    })
    .from(testsTable)
    .innerJoin(productsTable, eq(productsTable.id, testsTable.productId))
    .innerJoin(
      testVersionsTable,
      and(
        eq(testVersionsTable.testId, testsTable.id),
        isNotNull(testVersionsTable.publishedAt)
      )
    )
    .where(
      and(
        eq(testsTable.published, true),
        inArray(testsTable.productId, productIds)
      )
    );

  return NextResponse.json({ tests });
}
