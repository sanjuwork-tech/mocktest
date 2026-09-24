import { desc, eq, and, sql } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import {
  testsTable,
  productsTable,
  testVersionsTable,
  testSectionsTable,
  testAssignmentsTable,
  questionRevisionsTable,
  questionBankTable,
  auditLogTable,
} from "@/db/schema";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireOrigin(request);
    // Strict role check: only reviewers and administrators can publish tests
    const admin = await requireAdmin(["reviewer", "admin"]);
    const { id: testId } = await params;

    const db = requireDb();

    // 1. Fetch test
    const [test] = await db
      .select()
      .from(testsTable)
      .where(eq(testsTable.id, testId));

    if (!test) {
      throw new ApiError(404, "Test not found.");
    }

    // 2. Fetch latest draft version
    const [latestVersion] = await db
      .select()
      .from(testVersionsTable)
      .where(eq(testVersionsTable.testId, test.id))
      .orderBy(desc(testVersionsTable.version))
      .limit(1);

    if (!latestVersion) {
      throw new ApiError(404, "No version found for test.");
    }

    if (latestVersion.publishedAt !== null) {
      throw new ApiError(409, "This test version has already been published.");
    }

    // 3. Fetch sections
    const sections = await db
      .select()
      .from(testSectionsTable)
      .where(eq(testSectionsTable.testVersionId, latestVersion.id))
      .orderBy(testSectionsTable.position);

    if (sections.length === 0) {
      throw new ApiError(400, "Cannot publish a test with no sections configured.");
    }

    // 4. Fetch assignments with question revision status
    const assignments = await db
      .select({
        id: testAssignmentsTable.id,
        sectionId: testAssignmentsTable.sectionId,
        revisionId: testAssignmentsTable.revisionId,
        position: testAssignmentsTable.position,
        marks: testAssignmentsTable.marks,
        penalty: testAssignmentsTable.penalty,
        questionId: questionRevisionsTable.questionId,
        status: questionRevisionsTable.status,
        externalId: questionBankTable.externalId,
      })
      .from(testAssignmentsTable)
      .innerJoin(
        questionRevisionsTable,
        eq(testAssignmentsTable.revisionId, questionRevisionsTable.id),
      )
      .innerJoin(
        questionBankTable,
        eq(questionRevisionsTable.questionId, questionBankTable.id),
      )
      .where(eq(testAssignmentsTable.testVersionId, latestVersion.id));

    // 5. Run strict integrity checks
    const errors: string[] = [];

    // 5a. Check each section's required question count
    for (const sec of sections) {
      const secRules = sec.rules as { name?: string; questionCount?: number };
      const secName = secRules?.name || sec.subject;
      const expectedCount = secRules?.questionCount ?? 0;
      const secAssignments = assignments.filter((a) => a.sectionId === sec.id);

      if (expectedCount > 0 && secAssignments.length !== expectedCount) {
        errors.push(
          `Section "${secName}" requires ${expectedCount} questions, but has ${secAssignments.length}.`
        );
      }
    }

    // 5b. Verify that EVERY assigned question is approved
    const unapproved = assignments.filter((a) => a.status !== "approved");
    if (unapproved.length > 0) {
      for (const u of unapproved) {
        errors.push(
          `Question ${u.externalId} has status "${u.status}". Only approved question revisions can be published.`
        );
      }
    }

    // 5c. Check for duplicate questions
    const seenQuestionIds = new Set<string>();
    for (const a of assignments) {
      if (seenQuestionIds.has(a.questionId)) {
        errors.push(`Duplicate question detected: ${a.externalId} is assigned multiple times.`);
      }
      seenQuestionIds.add(a.questionId);
    }

    // 5d. Total marks check
    const totalAssignedMarks = assignments.reduce((acc, curr) => acc + curr.marks, 0);
    if (totalAssignedMarks !== test.totalMarks) {
      errors.push(
        `Total marks mismatch: Assigned questions sum to ${totalAssignedMarks} marks, but test definition requires ${test.totalMarks} marks.`
      );
    }

    if (errors.length > 0) {
      return json(
        {
          error: "Publication blocked: Test failed integrity validation.",
          details: errors,
        },
        400
      );
    }

    // 6. Execute atomic publication
    await db.transaction(async (tx) => {
      // Mark version published
      await tx
        .update(testVersionsTable)
        .set({ publishedAt: sql`now()` })
        .where(eq(testVersionsTable.id, latestVersion.id));

      // Mark test published
      await tx
        .update(testsTable)
        .set({ published: true })
        .where(eq(testsTable.id, test.id));

      // Reconcile catalog product mock count
      const [countResult] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(testsTable)
        .where(
          and(
            eq(testsTable.productId, test.productId),
            eq(testsTable.published, true)
          )
        );

      const actualPublishedMocks = countResult?.count ?? 0;

      await tx
        .update(productsTable)
        .set({ mockCount: actualPublishedMocks })
        .where(eq(productsTable.id, test.productId));

      // Audit trail
      await tx.insert(auditLogTable).values({
        actorId: admin.userId,
        action: "test.published",
        entityType: "test_version",
        entityId: latestVersion.id,
        details: {
          testId: test.id,
          version: latestVersion.version,
          totalQuestions: assignments.length,
          totalMarks: totalAssignedMarks,
          actualPublishedMocks,
        },
      });
    });

    return json({
      ok: true,
      message: `Test "${test.title}" version ${latestVersion.version} published successfully.`,
      versionId: latestVersion.id,
      publishedVersion: latestVersion.version,
    });
  } catch (e) {
    return apiError(e);
  }
}
