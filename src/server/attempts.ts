import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import {
  attemptsTable,
  attemptResultsTable,
  entitlementsTable,
} from "../db/schema.ts";
import { questionBank, questionsFor } from "../data/student/bank.ts";
import {
  analyze,
  type Attempt,
  type Response,
  type Subject,
} from "../lib/student/model.ts";
import type { StudentProfile } from "./student-auth.ts";
import {
  sanitizeQuestion,
  type SanitizedQuestion,
} from "../lib/student/scoring.ts";

// Re-export from the pure module so callers can still import from here
export { sanitizeQuestion, type SanitizedQuestion };

// In-memory attempts cache when running in demo/guest/DB-less mode
const memoryAttempts = new Map<string, Attempt>();
const memoryResults = new Map<
  string,
  {
    score: number;
    max: number;
    breakdown: ReturnType<typeof analyze>;
    reflections: Record<string, string>;
  }
>();

export async function checkEntitlement(
  student: StudentProfile,
  subject: Subject,
): Promise<{ allowed: boolean; isFreeTier: boolean }> {
  // 1 Free Diagnostic Mock per subject series is available to all students
  const freeSubjects: Subject[] = ["mathematics", "physics", "chemistry"];
  if (freeSubjects.includes(subject)) {
    return { allowed: true, isFreeTier: true };
  }

  if (!db || student.isGuest) {
    return { allowed: false, isFreeTier: false };
  }

  // Check active entitlements in DB
  const [entitlement] = await db
    .select()
    .from(entitlementsTable)
    .where(
      and(
        eq(entitlementsTable.userId, student.id),
        eq(entitlementsTable.revokedAt, null as unknown as Date),
      ),
    )
    .limit(1);

  return { allowed: Boolean(entitlement), isFreeTier: false };
}

export async function startAttempt(
  student: StudentProfile,
  subject: Subject,
): Promise<{
  attemptId: string;
  subject: Subject;
  startedAt: number;
  deadline: number;
  durationMinutes: number;
  questions: SanitizedQuestion[];
}> {
  const { allowed } = await checkEntitlement(student, subject);
  if (!allowed) {
    throw new Error("You need an active entitlement to access this test series.");
  }

  const allQuestions = questionsFor(subject);
  if (!allQuestions || allQuestions.length === 0) {
    throw new Error(`No questions available for ${subject}`);
  }

  const durationMinutes = 90;
  const startedAt = Date.now();
  const deadline = startedAt + durationMinutes * 60_000;
  const attemptId = crypto.randomUUID();

  // Create attempt in memory cache
  const newAttempt: Attempt = {
    id: attemptId,
    subject,
    startedAt,
    deadline,
    current: 0,
    responses: {},
    reflections: {},
  };
  memoryAttempts.set(attemptId, newAttempt);

  // If DB is available, persist attempt record
  if (db && !student.isGuest) {
    try {
      await db.insert(attemptsTable).values({
        id: attemptId,
        userId: student.id,
        testVersionId: attemptId, // Maps to current attempt version
        idempotencyKey: attemptId,
        status: "in_progress",
        startedAt: new Date(startedAt),
        deadline: new Date(deadline),
        ordering: allQuestions.map((q) => q.id),
      });
    } catch (err) {
      console.warn("Could not persist attempt to DB, using in-memory store:", err);
    }
  }

  // Deliver sanitized questions without correct answers or explanations
  const sanitized = allQuestions.map(sanitizeQuestion);

  return {
    attemptId,
    subject,
    startedAt,
    deadline,
    durationMinutes,
    questions: sanitized,
  };
}

export async function getAttempt(attemptId: string): Promise<Attempt | undefined> {
  const cached = memoryAttempts.get(attemptId);
  if (cached) return cached;

  if (db) {
    const [row] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId))
      .limit(1);

    if (row) {
      const qs = questionBank.find((q) => (row.ordering as string[])?.includes(q.id));
      const subject = (qs?.subject || "physics") as Subject;
      return {
        id: row.id,
        subject,
        startedAt: row.startedAt.getTime(),
        deadline: row.deadline.getTime(),
        submittedAt: row.submittedAt ? row.submittedAt.getTime() : undefined,
        timedOut: row.status === "timed_out",
        current: 0,
        responses: {},
        reflections: {},
      };
    }
  }

  return undefined;
}

export async function recordAnswer(
  attemptId: string,
  questionId: string,
  response: Response,
): Promise<{ success: boolean; deadline: number; timeRemaining: number }> {
  let attempt = memoryAttempts.get(attemptId);
  if (!attempt) {
    attempt = await getAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");
    memoryAttempts.set(attemptId, attempt);
  }

  const now = Date.now();
  // 60-second network grace window
  if (now > attempt.deadline + 60_000) {
    throw new Error("Deadline has expired. Test has concluded.");
  }

  attempt.responses[questionId] = response;
  memoryAttempts.set(attemptId, attempt);

  return {
    success: true,
    deadline: attempt.deadline,
    timeRemaining: Math.max(0, Math.round((attempt.deadline - now) / 1000)),
  };
}

export async function submitAttempt(
  attemptId: string,
  finalResponses?: Record<string, Response>,
): Promise<{
  attemptId: string;
  score: number;
  maxScore: number;
  breakdown: ReturnType<typeof analyze>;
}> {
  let attempt = memoryAttempts.get(attemptId);
  if (!attempt) {
    attempt = await getAttempt(attemptId);
    if (!attempt) throw new Error("Attempt not found");
  }

  // Merge any final or offline-buffered responses passed at submission
  if (finalResponses && typeof finalResponses === "object") {
    attempt.responses = { ...attempt.responses, ...finalResponses };
    memoryAttempts.set(attemptId, attempt);
  }

  const questions = questionsFor(attempt.subject);
  attempt.submittedAt = Date.now();
  const timedOut = Date.now() > attempt.deadline + 60_000;
  attempt.timedOut = timedOut;

  // Run server-authoritative scoring
  const breakdown = analyze(questions, attempt);

  memoryResults.set(attemptId, {
    score: breakdown.score,
    max: breakdown.max,
    breakdown,
    reflections: attempt.reflections || {},
  });

  if (db) {
    try {
      await db
        .update(attemptsTable)
        .set({
          status: timedOut ? "timed_out" : "submitted",
          submittedAt: new Date(attempt.submittedAt),
        })
        .where(eq(attemptsTable.id, attemptId));

      await db
        .insert(attemptResultsTable)
        .values({
          attemptId,
          score: breakdown.score,
          maxScore: breakdown.max,
          scoringVersion: "v1",
          breakdown: breakdown as unknown as Record<string, unknown>,
          answerSnapshot: attempt.responses as unknown as Record<string, unknown>,
          reflections: attempt.reflections || {},
        })
        .onConflictDoUpdate({
          target: attemptResultsTable.attemptId,
          set: {
            score: breakdown.score,
            maxScore: breakdown.max,
            breakdown: breakdown as unknown as Record<string, unknown>,
          },
        });
    } catch (err) {
      console.warn("Error saving results to database:", err);
    }
  }

  return {
    attemptId,
    score: breakdown.score,
    maxScore: breakdown.max,
    breakdown,
  };
}

export async function getAttemptResults(attemptId: string) {
  const cached = memoryResults.get(attemptId);
  const attempt = memoryAttempts.get(attemptId);

  if (cached && attempt) {
    const questions = questionsFor(attempt.subject);
    return {
      attempt,
      questions,
      result: cached.breakdown,
      reflections: cached.reflections,
    };
  }

  if (db) {
    const [resultRow] = await db
      .select()
      .from(attemptResultsTable)
      .where(eq(attemptResultsTable.attemptId, attemptId))
      .limit(1);

    const [attemptRow] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId))
      .limit(1);

    if (resultRow && attemptRow) {
      const ordering = (attemptRow.ordering as string[]) || [];
      const sampleQ = questionBank.find((q) => ordering.includes(q.id));
      const subject = (sampleQ?.subject || "physics") as Subject;
      const questions = questionsFor(subject);

      const reconstructedAttempt: Attempt = {
        id: attemptRow.id,
        subject,
        startedAt: attemptRow.startedAt.getTime(),
        deadline: attemptRow.deadline.getTime(),
        submittedAt: attemptRow.submittedAt?.getTime(),
        timedOut: attemptRow.status === "timed_out",
        current: 0,
        responses: (resultRow.answerSnapshot as Record<string, Response>) || {},
        reflections: (resultRow.reflections as Record<string, string>) || {},
      };

      return {
        attempt: reconstructedAttempt,
        questions,
        result: resultRow.breakdown as unknown as ReturnType<typeof analyze>,
        reflections: reconstructedAttempt.reflections,
      };
    }
  }

  return null;
}

export async function saveReflections(
  attemptId: string,
  reflections: Record<string, string>,
) {
  const attempt = memoryAttempts.get(attemptId);
  if (attempt) {
    attempt.reflections = { ...attempt.reflections, ...reflections };
  }

  const cached = memoryResults.get(attemptId);
  if (cached) {
    cached.reflections = { ...cached.reflections, ...reflections };
  }

  if (db) {
    try {
      await db
        .update(attemptResultsTable)
        .set({ reflections })
        .where(eq(attemptResultsTable.attemptId, attemptId));
    } catch (err) {
      console.warn("Failed to persist reflections to DB:", err);
    }
  }

  return { success: true };
}

export async function listStudentAttempts(student: StudentProfile) {
  const list: {
    id: string;
    subject: Subject;
    startedAt: number;
    submittedAt?: number;
    score: number;
    maxScore: number;
    accuracy: number | null;
    status: string;
  }[] = [];

  // Add from memory cache
  for (const [id, attempt] of memoryAttempts.entries()) {
    const res = memoryResults.get(id);
    if (res) {
      list.push({
        id,
        subject: attempt.subject,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        score: res.score,
        maxScore: res.max,
        accuracy: res.breakdown.accuracy,
        status: attempt.timedOut ? "Timed out" : "Completed",
      });
    }
  }

  // Add from database if available
  if (db && !student.isGuest) {
    try {
      const rows = await db
        .select({
          id: attemptsTable.id,
          status: attemptsTable.status,
          startedAt: attemptsTable.startedAt,
          submittedAt: attemptsTable.submittedAt,
          ordering: attemptsTable.ordering,
          score: attemptResultsTable.score,
          maxScore: attemptResultsTable.maxScore,
          breakdown: attemptResultsTable.breakdown,
        })
        .from(attemptsTable)
        .leftJoin(
          attemptResultsTable,
          eq(attemptResultsTable.attemptId, attemptsTable.id),
        )
        .where(eq(attemptsTable.userId, student.id))
        .orderBy(desc(attemptsTable.startedAt));

      for (const row of rows) {
        if (!list.some((item) => item.id === row.id)) {
          const sampleQ = questionBank.find((q) =>
            (row.ordering as string[])?.includes(q.id),
          );
          const breakdown = row.breakdown as ReturnType<typeof analyze> | null;
          list.push({
            id: row.id,
            subject: (sampleQ?.subject || "physics") as Subject,
            startedAt: row.startedAt.getTime(),
            submittedAt: row.submittedAt?.getTime(),
            score: row.score ?? 0,
            maxScore: row.maxScore ?? 200,
            accuracy: breakdown?.accuracy ?? null,
            status: row.status === "timed_out" ? "Timed out" : "Completed",
          });
        }
      }
    } catch (err) {
      console.warn("Could not query student attempts from DB:", err);
    }
  }

  return list;
}
