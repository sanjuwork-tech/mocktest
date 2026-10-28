import "server-only";
import { eq } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { attemptQuestionStatsTable } from "@/db/schema";
import { analyseAttempt, type AnalysisQuestion } from "@/lib/analysis";
import type { loadPaper } from "@/server/student-tests";

type Paper = Awaited<ReturnType<typeof loadPaper>>;

/** Joins a released paper (with keys), the student's answers and per-question stats into an analysis. */
export async function buildAttemptAnalysis(
  attemptId: string,
  paper: Paper,
  answers: { assignmentId: string; value: unknown; marked: boolean }[],
) {
  const stats = await requireDb()
    .select()
    .from(attemptQuestionStatsTable)
    .where(eq(attemptQuestionStatsTable.attemptId, attemptId));
  const statsBy = new Map(stats.map((s) => [s.assignmentId, s]));
  const answerBy = new Map(answers.map((a) => [a.assignmentId, a]));
  const sectionName = new Map(paper.sections.map((s) => [s.id, s.name]));
  const counters = new Map<string, number>();

  const questions: AnalysisQuestion[] = paper.questions.map((q) => {
    const n = (counters.get(q.sectionId) ?? 0) + 1;
    counters.set(q.sectionId, n);
    const a = answerBy.get(q.assignmentId);
    const st = statsBy.get(q.assignmentId);
    const value = typeof a?.value === "string" ? a.value : null;
    return {
      number: n,
      sectionId: q.sectionId,
      sectionName: sectionName.get(q.sectionId) ?? "",
      topics: q.topics ?? [],
      difficulty: q.difficulty ?? null,
      marks: q.marks,
      penalty: q.penalty,
      correctOptionId: q.correctOptionId ?? "",
      value,
      firstValue: st?.firstValue ?? null,
      changes: st?.changes ?? 0,
      timeMs: st?.timeMs ?? 0,
      // An answered question was clearly visited even if no timing reached the server.
      visits: Math.max(st?.visits ?? 0, value ? 1 : 0),
      marked: a?.marked ?? false,
    };
  });

  return analyseAttempt(questions, paper.test.durationSeconds);
}
