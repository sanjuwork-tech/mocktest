/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq } from "drizzle-orm";
import { requireDb } from "../db/client.ts";
import {
  attemptsTable,
  attemptAnswersTable,
  testAssignmentsTable,
  questionRevisionsTable,
  answerKeysTable,
  attemptResultsTable,
} from "../db/schema.ts";
import { correct, answered } from "../lib/student/model.ts";

export async function processAttemptScoring(attemptId: string) {
  const db = requireDb();

  return await db.transaction(async (tx) => {
    // 1. Lock the attempt row to prevent concurrent scoring
    const [attempt] = await tx
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId))
      .for("update");

    if (!attempt) throw new Error("Attempt not found");
    if (attempt.status === "in_progress") {
      throw new Error("Cannot score an in_progress attempt");
    }

    // 2. Check if already scored
    const [existing] = await tx
      .select()
      .from(attemptResultsTable)
      .where(eq(attemptResultsTable.attemptId, attemptId));

    if (existing) return existing;

    // 3. Fetch all test assignments, question info, and answer keys
    const assignments = await tx
      .select({
        assignment: testAssignmentsTable,
        revision: questionRevisionsTable,
        key: answerKeysTable,
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
      .where(eq(testAssignmentsTable.testVersionId, attempt.testVersionId));

    // 4. Fetch all student answers
    const answers = await tx
      .select()
      .from(attemptAnswersTable)
      .where(eq(attemptAnswersTable.attemptId, attemptId));

    const answerMap = new Map(answers.map((a) => [a.assignmentId, a]));

    let totalScore = 0;
    let maxScore = 0;
    const breakdown: Record<string, { total: number; attempted: number; correct: number; wrong: number; unanswered: number }> = {};
    const answerSnapshot: Record<string, unknown> = {};

    for (const { assignment, revision, key } of assignments) {
      maxScore += assignment.marks;

      const studentAnswer = answerMap.get(assignment.id);
      const studentValue = studentAnswer?.value ?? null;


      const mockQuestion = {
        type: revision.type as any,
        correct: key.answer as any,
        tolerance: (revision.content as any).tolerance,
        left: (revision.content as any).left,
        options: (revision.content as any).options,
      };

      const mockResponse = studentValue !== null ? { value: studentValue as any, seconds: 0, marked: false, changes: 0 } : undefined;

      const isAnswered = answered(mockQuestion as any, mockResponse);
      const isCorrect = correct(mockQuestion as any, mockResponse);

      let points = 0;
      if (isAnswered) {
        if (isCorrect) {
          points = assignment.marks;
        } else {
          points = -assignment.penalty;
        }
      }
      
      totalScore += points;

      // Track by topic
      for (const topic of revision.topics) {
        if (!breakdown[topic]) {
          breakdown[topic] = {
            total: 0,
            attempted: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
          };
        }
        breakdown[topic].total++;
        if (isAnswered) {
          breakdown[topic].attempted++;
          if (isCorrect) breakdown[topic].correct++;
          else breakdown[topic].wrong++;
        } else {
          breakdown[topic].unanswered++;
        }
      }

      answerSnapshot[assignment.id] = {
        assignmentId: assignment.id,
        isAnswered,
        isCorrect,
        points,
        studentValue,
      };
    }

    const [result] = await tx
      .insert(attemptResultsTable)
      .values({
        attemptId,
        score: totalScore,
        maxScore,
        scoringVersion: "v1",
        breakdown,
        answerSnapshot,
      })
      .returning();

    return result;
  });
}
