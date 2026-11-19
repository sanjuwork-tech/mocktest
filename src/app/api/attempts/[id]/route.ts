import { eq } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json } from "@/server/http";
import { requireDb } from "@/db/client";
import { finalizeIfOverdue } from "@/server/deadline";
import { loadPaper } from "@/server/student-tests";
import { attemptSectionIds } from "@/server/scoring";
import { attemptsTable, attemptAnswersTable, attemptQuestionStatsTable } from "@/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/attempts/:id — Attempt state for the test player.
 *
 * Returns the deadline, saved answers and question content. Never includes answer keys.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const student = await requireStudent();
    const { id: attemptId } = await params;
    const db = requireDb();

    const [owned] = await db
      .select({ userId: attemptsTable.userId })
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId));
    if (!owned || owned.userId !== student.userId) throw new ApiError(404, "Attempt not found.");

    await finalizeIfOverdue(attemptId);

    const [attempt] = await db.select().from(attemptsTable).where(eq(attemptsTable.id, attemptId));
    const answers = await db
      .select({
        assignmentId: attemptAnswersTable.assignmentId,
        value: attemptAnswersTable.value,
        sequence: attemptAnswersTable.sequence,
        marked: attemptAnswersTable.marked,
      })
      .from(attemptAnswersTable)
      .where(eq(attemptAnswersTable.attemptId, attemptId));

    // Saved time per question lets the player resume its per-question timers after a reload.
    const questionTimes: Record<string, number> = {};
    if (attempt.status === "in_progress") {
      const stats = await db
        .select({ assignmentId: attemptQuestionStatsTable.assignmentId, timeMs: attemptQuestionStatsTable.timeMs })
        .from(attemptQuestionStatsTable)
        .where(eq(attemptQuestionStatsTable.attemptId, attemptId));
      for (const r of stats) if (r.timeMs > 0) questionTimes[r.assignmentId] = r.timeMs;
    }

    const paper = await loadPaper(attempt.testVersionId, { includeKeys: false, sectionIds: attemptSectionIds(attempt.ordering) });

    return json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        serverNow: new Date().toISOString(),
        deadline: attempt.deadline.toISOString(),
        startedAt: attempt.startedAt.toISOString(),
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
      },
      ...paper,
      answers,
      questionTimes,
    });
  } catch (e) {
    return apiError(e);
  }
}
