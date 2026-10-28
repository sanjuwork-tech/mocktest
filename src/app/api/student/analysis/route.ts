import { and, desc, eq, inArray } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, json } from "@/server/http";
import { requireDb } from "@/db/client";
import { attemptAnswersTable, attemptResultsTable, attemptsTable } from "@/db/schema";
import { loadPaper } from "@/server/student-tests";
import { buildAttemptAnalysis } from "@/server/attempt-analysis";
import { analyseOverall } from "@/lib/analysis";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 40;

/** GET /api/student/analysis — the student's overall analysis across finished attempts. */
export async function GET() {
  try {
    const student = await requireStudent();
    const db = requireDb();
    const attempts = await db
      .select({
        id: attemptsTable.id,
        testVersionId: attemptsTable.testVersionId,
        submittedAt: attemptsTable.submittedAt,
        score: attemptResultsTable.score,
        maxScore: attemptResultsTable.maxScore,
      })
      .from(attemptsTable)
      .innerJoin(attemptResultsTable, eq(attemptResultsTable.attemptId, attemptsTable.id))
      .where(and(eq(attemptsTable.userId, student.userId), inArray(attemptsTable.status, ["submitted", "timed_out"])))
      .orderBy(desc(attemptsTable.submittedAt))
      .limit(MAX_ATTEMPTS);

    const papers = new Map<string, Awaited<ReturnType<typeof loadPaper>>>();
    const analysed = [];
    for (const a of attempts) {
      if (!papers.has(a.testVersionId)) papers.set(a.testVersionId, await loadPaper(a.testVersionId, { includeKeys: true }));
      const paper = papers.get(a.testVersionId)!;
      const answers = await db
        .select({ assignmentId: attemptAnswersTable.assignmentId, value: attemptAnswersTable.value, marked: attemptAnswersTable.marked })
        .from(attemptAnswersTable)
        .where(eq(attemptAnswersTable.attemptId, a.id));
      analysed.push({
        attemptId: a.id,
        title: paper.test.title,
        exam: paper.test.exam,
        subject: paper.test.subject,
        date: (a.submittedAt ?? new Date()).toISOString(),
        score: a.score,
        maxScore: a.maxScore,
        analysis: await buildAttemptAnalysis(a.id, paper, answers),
      });
    }

    return json({ student: { name: student.name }, overall: analyseOverall(analysed) });
  } catch (e) {
    return apiError(e);
  }
}
