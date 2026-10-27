import { eq } from "drizzle-orm";
import { requireDb } from "../db/client.ts";
import {
  attemptsTable,
  attemptAnswersTable,
  testAssignmentsTable,
  testSectionsTable,
  testVersionsTable,
  questionRevisionsTable,
  answerKeysTable,
  attemptResultsTable,
} from "../db/schema.ts";

export const SCORING_VERSION = "v2";

type Tally = { total: number; correct: number; wrong: number; unanswered: number };

export type SectionResult = Tally & {
  sectionId: string;
  subject: string;
  score: number;
  maxScore: number;
  /** False when a best-of-N policy (NEST) left this section out of the total. */
  counted: boolean;
};

export type ResultBreakdown = {
  sections: SectionResult[];
  topics: Record<string, Tally>;
  bestSections: number | null;
};

export type ScoredAnswer = {
  assignmentId: string;
  sectionId: string;
  isAnswered: boolean;
  isCorrect: boolean;
  points: number;
  studentValue: string | null;
  correctOptionId: string;
};

export type ScoringInput = {
  assignments: {
    id: string;
    sectionId: string;
    marks: number;
    penalty: number;
    topics: string[];
    correctOptionId: string;
  }[];
  sections: { id: string; subject: string; position: number }[];
  answers: Map<string, unknown>;
  bestSections?: number | null;
};

const emptyTally = (): Tally => ({ total: 0, correct: 0, wrong: 0, unanswered: 0 });

/** Pure scoring for single-correct questions: +marks if right, −penalty if wrong, 0 if unanswered. */
export function scoreAttempt({ assignments, sections, answers, bestSections }: ScoringInput) {
  const sectionResults = new Map<string, SectionResult>(
    [...sections]
      .sort((a, b) => a.position - b.position)
      .map((s) => [
        s.id,
        { sectionId: s.id, subject: s.subject, score: 0, maxScore: 0, counted: true, ...emptyTally() },
      ]),
  );
  const topics: Record<string, Tally> = {};
  const snapshot: Record<string, ScoredAnswer> = {};

  for (const a of assignments) {
    const section = sectionResults.get(a.sectionId);
    if (!section) throw new Error(`Assignment ${a.id} has no section.`);
    const raw = answers.get(a.id);
    const value = typeof raw === "string" && raw.length > 0 ? raw : null;
    const isAnswered = value !== null;
    const isCorrect = isAnswered && value === a.correctOptionId;
    const points = !isAnswered ? 0 : isCorrect ? a.marks : -a.penalty;

    section.maxScore += a.marks;
    section.score += points;
    section.total++;
    const outcome = !isAnswered ? "unanswered" : isCorrect ? "correct" : "wrong";
    section[outcome]++;
    for (const topic of a.topics) {
      topics[topic] ??= emptyTally();
      topics[topic].total++;
      topics[topic][outcome]++;
    }

    snapshot[a.id] = {
      assignmentId: a.id,
      sectionId: a.sectionId,
      isAnswered,
      isCorrect,
      points,
      studentValue: value,
      correctOptionId: a.correctOptionId,
    };
  }

  const all = [...sectionResults.values()];
  let counted = all;
  if (bestSections && bestSections < all.length) {
    counted = [...all].sort((a, b) => b.score - a.score).slice(0, bestSections);
    for (const s of all) s.counted = counted.includes(s);
  }
  // Under best-of-N every section has the same weight, so the maximum is N full sections.
  const maxScore = counted.reduce((sum, s) => sum + s.maxScore, 0);
  const score = counted.reduce((sum, s) => sum + s.score, 0);

  const breakdown: ResultBreakdown = { sections: all, topics, bestSections: bestSections ?? null };
  return { score, maxScore, breakdown, snapshot };
}

/** Scores a finalized attempt exactly once; repeated calls return the stored result. */
export async function processAttemptScoring(attemptId: string) {
  const db = requireDb();

  return await db.transaction(async (tx) => {
    const [attempt] = await tx
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId))
      .for("update");

    if (!attempt) throw new Error("Attempt not found");
    if (attempt.status === "in_progress") {
      throw new Error("Cannot score an in_progress attempt");
    }

    const [existing] = await tx
      .select()
      .from(attemptResultsTable)
      .where(eq(attemptResultsTable.attemptId, attemptId));
    if (existing) return existing;

    const [version] = await tx
      .select({ rules: testVersionsTable.rules })
      .from(testVersionsTable)
      .where(eq(testVersionsTable.id, attempt.testVersionId));
    const rules = (version?.rules ?? {}) as { scoringPolicy?: { bestSections?: number } };

    const sections = await tx
      .select({ id: testSectionsTable.id, subject: testSectionsTable.subject, position: testSectionsTable.position })
      .from(testSectionsTable)
      .where(eq(testSectionsTable.testVersionId, attempt.testVersionId));

    const rows = await tx
      .select({
        id: testAssignmentsTable.id,
        sectionId: testAssignmentsTable.sectionId,
        marks: testAssignmentsTable.marks,
        penalty: testAssignmentsTable.penalty,
        topics: questionRevisionsTable.topics,
        answer: answerKeysTable.answer,
      })
      .from(testAssignmentsTable)
      .innerJoin(questionRevisionsTable, eq(testAssignmentsTable.revisionId, questionRevisionsTable.id))
      .innerJoin(answerKeysTable, eq(testAssignmentsTable.revisionId, answerKeysTable.revisionId))
      .where(eq(testAssignmentsTable.testVersionId, attempt.testVersionId));

    const answers = await tx
      .select({ assignmentId: attemptAnswersTable.assignmentId, value: attemptAnswersTable.value })
      .from(attemptAnswersTable)
      .where(eq(attemptAnswersTable.attemptId, attemptId));

    const { score, maxScore, breakdown, snapshot } = scoreAttempt({
      sections,
      assignments: rows.map((r) => ({
        ...r,
        correctOptionId: (r.answer as { correctOptionId: string }).correctOptionId,
      })),
      answers: new Map(answers.map((a) => [a.assignmentId, a.value])),
      bestSections: rules.scoringPolicy?.bestSections,
    });

    const [result] = await tx
      .insert(attemptResultsTable)
      .values({
        attemptId,
        score,
        maxScore,
        scoringVersion: SCORING_VERSION,
        breakdown,
        answerSnapshot: snapshot,
      })
      .returning();

    return result;
  });
}
