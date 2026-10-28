import { eq } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json } from "@/server/http";
import { requireDb } from "@/db/client";
import { finalizeIfOverdue } from "@/server/deadline";
import { processAttemptScoring } from "@/server/scoring";
import { loadPaper } from "@/server/student-tests";
import { attemptsTable, attemptAnswersTable } from "@/db/schema";
import { buildAttemptAnalysis } from "@/server/attempt-analysis";

export const runtime = "nodejs";

/**
 * GET /api/results/:id — Score, breakdown, answers and solutions of a finished attempt.
 *
 * Answer keys and explanations are released only once the attempt is final.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const student = await requireStudent();
    const { id } = await params;
    const db = requireDb();

    const [owned] = await db
      .select({ userId: attemptsTable.userId })
      .from(attemptsTable)
      .where(eq(attemptsTable.id, id));
    if (!owned || owned.userId !== student.userId) throw new ApiError(404, "Attempt not found.");

    await finalizeIfOverdue(id);
    const [attempt] = await db.select().from(attemptsTable).where(eq(attemptsTable.id, id));
    if (attempt.status === "in_progress")
      throw new ApiError(409, "This test is still in progress.");

    // Scores on first view if scoring after submission failed; otherwise returns the stored result.
    const result = await processAttemptScoring(id);

    const answers = await db
      .select({ assignmentId: attemptAnswersTable.assignmentId, value: attemptAnswersTable.value, marked: attemptAnswersTable.marked })
      .from(attemptAnswersTable)
      .where(eq(attemptAnswersTable.attemptId, id));

    const paper = await loadPaper(attempt.testVersionId, { includeKeys: true });
    const analysis = await buildAttemptAnalysis(id, paper, answers);

    return json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt.toISOString(),
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
      },
      result: {
        score: result.score,
        maxScore: result.maxScore,
        breakdown: result.breakdown,
      },
      ...paper,
      answers,
      analysis,
    });
  } catch (e) {
    return apiError(e);
  }
}
