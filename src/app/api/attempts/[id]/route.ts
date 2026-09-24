import { eq, and, sql } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json } from "@/server/http";
import { requireDb } from "@/db/client";
import { finalizeIfOverdue } from "@/server/deadline";
import {
  attemptsTable,
  attemptAnswersTable,
  testVersionsTable,
  testSectionsTable,
  testAssignmentsTable,
  questionRevisionsTable,
  questionOptionsTable,
} from "@/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/attempts/:id — Get current attempt state
 *
 * Returns attempt status, deadline, acknowledged answers, and question content.
 * NEVER includes answer keys.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const student = await requireStudent();
    const { id: attemptId } = await params;

    const db = requireDb();

    // Check ownership
    const [attempt] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId));

    if (!attempt) throw new ApiError(404, "Attempt not found.");
    if (attempt.userId !== student.userId) {
      throw new ApiError(403, "You do not have access to this attempt.");
    }

    // Check if overdue and finalize inline
    await finalizeIfOverdue(attemptId);

    // Re-fetch after potential finalization
    const [current] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId));

    // Load acknowledged answers
    const answers = await db
      .select({
        assignmentId: attemptAnswersTable.assignmentId,
        value: attemptAnswersTable.value,
        sequence: attemptAnswersTable.sequence,
        marked: attemptAnswersTable.marked,
        updatedAt: attemptAnswersTable.updatedAt,
      })
      .from(attemptAnswersTable)
      .where(eq(attemptAnswersTable.attemptId, attemptId));

    // Load test version info
    const [version] = await db
      .select({
        title: testVersionsTable.title,
        durationSeconds: testVersionsTable.durationSeconds,
        rules: testVersionsTable.rules,
      })
      .from(testVersionsTable)
      .where(eq(testVersionsTable.id, current.testVersionId));

    // Load sections
    const sections = await db
      .select({
        id: testSectionsTable.id,
        subject: testSectionsTable.subject,
        position: testSectionsTable.position,
        rules: testSectionsTable.rules,
      })
      .from(testSectionsTable)
      .where(eq(testSectionsTable.testVersionId, current.testVersionId))
      .orderBy(testSectionsTable.position);

    // Load assignments with question content (no answer keys)
    const assignments = await db
      .select({
        id: testAssignmentsTable.id,
        sectionId: testAssignmentsTable.sectionId,
        revisionId: testAssignmentsTable.revisionId,
        position: testAssignmentsTable.position,
        marks: testAssignmentsTable.marks,
        penalty: testAssignmentsTable.penalty,
      })
      .from(testAssignmentsTable)
      .where(eq(testAssignmentsTable.testVersionId, current.testVersionId))
      .orderBy(testAssignmentsTable.position);

    const revisionIds = assignments.map((a) => a.revisionId);
    let questions: Array<Record<string, unknown>> = [];

    if (revisionIds.length > 0) {
      const revisions = await db
        .select({
          id: questionRevisionsTable.id,
          type: questionRevisionsTable.type,
          subject: questionRevisionsTable.subject,
          content: questionRevisionsTable.content,
        })
        .from(questionRevisionsTable)
        .where(
          sql`${questionRevisionsTable.id} IN (${sql.join(
            revisionIds.map((id) => sql`${id}::uuid`),
            sql`, `,
          )})`,
        );

      const options = await db
        .select({
          revisionId: questionOptionsTable.revisionId,
          optionKey: questionOptionsTable.optionKey,
          position: questionOptionsTable.position,
          content: questionOptionsTable.content,
        })
        .from(questionOptionsTable)
        .where(
          sql`${questionOptionsTable.revisionId} IN (${sql.join(
            revisionIds.map((id) => sql`${id}::uuid`),
            sql`, `,
          )})`,
        )
        .orderBy(questionOptionsTable.position);

      const revMap = new Map(revisions.map((r) => [r.id, r]));
      const optMap = new Map<string, typeof options>();
      for (const o of options) {
        const list = optMap.get(o.revisionId) || [];
        list.push(o);
        optMap.set(o.revisionId, list);
      }

      questions = assignments.map((a) => {
        const rev = revMap.get(a.revisionId);
        return {
          assignmentId: a.id,
          sectionId: a.sectionId,
          position: a.position,
          marks: a.marks,
          penalty: a.penalty,
          type: rev?.type ?? "single_choice",
          subject: rev?.subject ?? "",
          content: rev?.content ?? [],
          options: (optMap.get(a.revisionId) || []).map((o) => ({
            key: o.optionKey,
            position: o.position,
            content: o.content,
          })),
        };
      });
    }

    return json({
      attempt: {
        id: current.id,
        status: current.status,
        serverNow: new Date().toISOString(),
        deadline: current.deadline.toISOString(),
        startedAt: current.startedAt.toISOString(),
        submittedAt: current.submittedAt?.toISOString() ?? null,
        ordering: current.ordering,
      },
      test: version,
      sections,
      questions,
      answers,
    });
  } catch (e) {
    return apiError(e);
  }
}
