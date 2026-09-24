import { eq } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json } from "@/server/http";
import { requireDb } from "@/db/client";
import {
  attemptsTable,
  attemptResultsTable,
  attemptAnswersTable,
  testAssignmentsTable,
  questionRevisionsTable,
  answerKeysTable,
  testsTable,
  testSectionsTable,
} from "@/db/schema";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const student = await requireStudent();
    const { id } = await params;
    const db = requireDb();

    // 1. Fetch Attempt
    const [attempt] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, id));

    if (!attempt) throw new ApiError(404, "Attempt not found.");
    if (attempt.userId !== student.userId) {
      throw new ApiError(403, "You do not have access to this attempt.");
    }

    if (attempt.status !== "submitted" && attempt.status !== "timed_out") {
      throw new ApiError(403, "Results are only available for finalized attempts.");
    }

    // 2. Fetch Result
    const [result] = await db
      .select()
      .from(attemptResultsTable)
      .where(eq(attemptResultsTable.attemptId, id));

    if (!result) {
      throw new ApiError(404, "Results are still processing. Please check back shortly.");
    }

    // 3. Fetch Test Details
    const [test] = await db
      .select()
      .from(testsTable)
      .where(eq(testsTable.id, attempt.testVersionId));

    // 4. Fetch Sections
    const sections = await db
      .select()
      .from(testSectionsTable)
      .where(eq(testSectionsTable.testVersionId, attempt.testVersionId))
      .orderBy(testSectionsTable.position);

    // 5. Fetch full question data including answer keys
    const questions = await db
      .select({
        assignmentId: testAssignmentsTable.id,
        sectionId: testAssignmentsTable.sectionId,
        position: testAssignmentsTable.position,
        marks: testAssignmentsTable.marks,
        penalty: testAssignmentsTable.penalty,
        subject: questionRevisionsTable.subject,
        type: questionRevisionsTable.type,
        topics: questionRevisionsTable.topics,
        content: questionRevisionsTable.content,
        // Include correct answer and explanation for results view
        answer: answerKeysTable.answer,
        explanation: answerKeysTable.explanation,
      })
      .from(testAssignmentsTable)
      .innerJoin(
        questionRevisionsTable,
        eq(testAssignmentsTable.revisionId, questionRevisionsTable.id),
      )
      .innerJoin(
        answerKeysTable,
        eq(testAssignmentsTable.revisionId, answerKeysTable.revisionId),
      )
      .where(eq(testAssignmentsTable.testVersionId, attempt.testVersionId))
      .orderBy(testAssignmentsTable.position);

    // 6. Fetch Student Answers
    const answers = await db
      .select({
        assignmentId: attemptAnswersTable.assignmentId,
        value: attemptAnswersTable.value,
        marked: attemptAnswersTable.marked,
        sequence: attemptAnswersTable.sequence,
      })
      .from(attemptAnswersTable)
      .where(eq(attemptAnswersTable.attemptId, id));

    return json({
      attempt,
      result,
      test,
      sections,
      questions,
      answers,
    });
  } catch (e) {
    return apiError(e);
  }
}
