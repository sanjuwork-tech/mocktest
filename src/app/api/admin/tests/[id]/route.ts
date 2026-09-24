import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import {
  testsTable,
  productsTable,
  testVersionsTable,
  testSectionsTable,
  testAssignmentsTable,
  questionRevisionsTable,
  questionBankTable,
  questionOptionsTable,
  answerKeysTable,
} from "@/db/schema";

export const runtime = "nodejs";

const patchAssignmentsSchema = z.object({
  assignments: z.array(
    z.object({
      sectionId: z.string().uuid(),
      revisionId: z.string().uuid(),
      position: z.number().int().min(0),
      marks: z.number().int().positive(),
      penalty: z.number().int().min(0),
    })
  ),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireOrigin(request);
    await requireAdmin(["editor", "reviewer", "admin"]);
    const { id: testId } = await params;

    const db = requireDb();

    // Fetch test
    const [test] = await db
      .select({
        id: testsTable.id,
        productId: testsTable.productId,
        title: testsTable.title,
        durationMinutes: testsTable.durationMinutes,
        totalMarks: testsTable.totalMarks,
        published: testsTable.published,
        createdAt: testsTable.createdAt,
        productTitle: productsTable.title,
        productSlug: productsTable.slug,
        exam: productsTable.exam,
      })
      .from(testsTable)
      .innerJoin(productsTable, eq(testsTable.productId, productsTable.id))
      .where(eq(testsTable.id, testId));

    if (!test) {
      throw new ApiError(404, "Test not found.");
    }

    // Fetch latest version
    const [latestVersion] = await db
      .select()
      .from(testVersionsTable)
      .where(eq(testVersionsTable.testId, test.id))
      .orderBy(desc(testVersionsTable.version))
      .limit(1);

    if (!latestVersion) {
      throw new ApiError(404, "No version found for test.");
    }

    // Fetch sections
    const sections = await db
      .select()
      .from(testSectionsTable)
      .where(eq(testSectionsTable.testVersionId, latestVersion.id))
      .orderBy(testSectionsTable.position);

    // Fetch assignments
    const assignments = await db
      .select({
        id: testAssignmentsTable.id,
        sectionId: testAssignmentsTable.sectionId,
        revisionId: testAssignmentsTable.revisionId,
        position: testAssignmentsTable.position,
        marks: testAssignmentsTable.marks,
        penalty: testAssignmentsTable.penalty,
        externalId: questionBankTable.externalId,
        subject: questionRevisionsTable.subject,
        status: questionRevisionsTable.status,
        content: questionRevisionsTable.content,
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
      .where(eq(testAssignmentsTable.testVersionId, latestVersion.id))
      .orderBy(testAssignmentsTable.position);

    // Fetch options and answer keys for assigned questions
    const revisionIds = assignments.map((a) => a.revisionId);
    let options: any[] = [];
    let answerKeys: any[] = [];

    if (revisionIds.length > 0) {
      [options, answerKeys] = await Promise.all([
        db
          .select()
          .from(questionOptionsTable)
          .where(
            sql`${questionOptionsTable.revisionId} IN (${sql.join(
              revisionIds.map((id) => sql`${id}::uuid`),
              sql`, `,
            )})`,
          )
          .orderBy(questionOptionsTable.position),
        db
          .select()
          .from(answerKeysTable)
          .where(
            sql`${answerKeysTable.revisionId} IN (${sql.join(
              revisionIds.map((id) => sql`${id}::uuid`),
              sql`, `,
            )})`,
          ),
      ]);
    }

    const optionsByRev = new Map<string, typeof options>();
    for (const opt of options) {
      const list = optionsByRev.get(opt.revisionId) || [];
      list.push(opt);
      optionsByRev.set(opt.revisionId, list);
    }

    const answersByRev = new Map<string, (typeof answerKeys)[0]>();
    for (const ans of answerKeys) {
      answersByRev.set(ans.revisionId, ans);
    }

    const fullAssignments = assignments.map((a) => {
      const ans = answersByRev.get(a.revisionId);
      return {
        ...a,
        options: optionsByRev.get(a.revisionId) || [],
        answer: ans?.answer || null,
        explanation: ans?.explanation || null,
      };
    });

    return json({
      test,
      version: latestVersion,
      sections,
      assignments: fullAssignments,
    });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireOrigin(request);
    await requireAdmin(["editor", "reviewer", "admin"]);
    const { id: testId } = await params;

    const body = await readJson(request, 1024 * 1024);
    const parsed = patchAssignmentsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid assignments payload.");
    }

    const db = requireDb();

    // Fetch latest version
    const [latestVersion] = await db
      .select()
      .from(testVersionsTable)
      .where(eq(testVersionsTable.testId, testId))
      .orderBy(desc(testVersionsTable.version))
      .limit(1);

    if (!latestVersion) {
      throw new ApiError(404, "Test version not found.");
    }

    if (latestVersion.publishedAt !== null) {
      throw new ApiError(409, "Cannot modify a published test version. Create a new revision to make changes.");
    }

    // Save assignments in a transaction
    await db.transaction(async (tx) => {
      // Clear existing draft assignments for this version
      await tx
        .delete(testAssignmentsTable)
        .where(eq(testAssignmentsTable.testVersionId, latestVersion.id));

      if (parsed.data.assignments.length > 0) {
        const values = parsed.data.assignments.map((a) => ({
          testVersionId: latestVersion.id,
          sectionId: a.sectionId,
          revisionId: a.revisionId,
          position: a.position,
          marks: a.marks,
          penalty: a.penalty,
        }));

        await tx.insert(testAssignmentsTable).values(values);
      }
    });

    return json({
      ok: true,
      message: "Assignments saved successfully.",
      count: parsed.data.assignments.length,
    });
  } catch (e) {
    return apiError(e);
  }
}
