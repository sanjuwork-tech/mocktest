import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { finalizeIfOverdue } from "@/server/deadline";
import { accessFor, activeProductIds, publishedTests, studentAttempts } from "@/server/student-tests";
import {
  attemptsTable,
  testSectionsTable,
  testAssignmentsTable,
  auditLogTable,
} from "@/db/schema";

export const runtime = "nodejs";

const startSchema = z.object({
  testId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(128),
  /** The optional section chosen on the intro (CUET A + B1/B2 papers); fixed for the attempt. */
  section: z.string().max(8).optional(),
});

/**
 * POST /api/attempts — Start (or resume) an attempt on a test's newest published version.
 *
 * Idempotent: replaying the same idempotencyKey, or starting a test that already has an
 * attempt in progress, returns that attempt without granting extra time.
 */
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const student = await requireStudent();

    const parsed = startSchema.safeParse(await readJson(request, 16384));
    if (!parsed.success) throw new ApiError(400, "Invalid start request.");
    const { testId, idempotencyKey, section } = parsed.data;
    const db = requireDb();

    const [test] = await publishedTests({ testId });
    if (!test) throw new ApiError(404, "This test is not available.");
    if (accessFor(test, await activeProductIds(student.userId)) === "locked")
      throw new ApiError(403, "This test is part of a paid series you haven't unlocked yet.");

    const [replayed] = await db
      .select({ id: attemptsTable.id, userId: attemptsTable.userId })
      .from(attemptsTable)
      .where(eq(attemptsTable.idempotencyKey, idempotencyKey));
    if (replayed) {
      if (replayed.userId !== student.userId) throw new ApiError(409, "Start the test again.");
      return json({ ok: true, replay: true, attemptId: replayed.id });
    }

    for (const active of await studentAttempts(student.userId, [testId])) {
      if (active.status !== "in_progress") continue;
      if (!(await finalizeIfOverdue(active.attemptId)))
        return json({ ok: true, replay: true, attemptId: active.attemptId });
    }

    const allSections = await db
      .select({ id: testSectionsTable.id, subject: testSectionsTable.subject, position: testSectionsTable.position, rules: testSectionsTable.rules })
      .from(testSectionsTable)
      .where(eq(testSectionsTable.testVersionId, test.versionId))
      .orderBy(testSectionsTable.position);
    // NTA optional sections: the candidate attempts the compulsory sections plus exactly one optional section.
    const rulesOf = (s: (typeof allSections)[number]) => s.rules as { id?: string; optional?: boolean };
    const optional = allSections.filter((s) => rulesOf(s).optional);
    const chosen = optional.find((s) => rulesOf(s).id === section);
    if (optional.length && !chosen) throw new ApiError(400, "Choose one optional section before starting.");
    if (!optional.length && section) throw new ApiError(400, "This test has no optional sections.");
    const sections = allSections
      .filter((s) => !rulesOf(s).optional || s === chosen)
      .map(({ id, subject, position }) => ({ id, subject, position }));
    const inPaper = new Set(sections.map((s) => s.id));
    const assignments = (await db
      .select({ id: testAssignmentsTable.id, sectionId: testAssignmentsTable.sectionId, position: testAssignmentsTable.position })
      .from(testAssignmentsTable)
      .where(eq(testAssignmentsTable.testVersionId, test.versionId))
      .orderBy(testAssignmentsTable.position)).filter((a) => inPaper.has(a.sectionId));
    if (!assignments.length) throw new ApiError(409, "This test has no questions yet.");

    const startedAt = new Date();
    const deadline = new Date(startedAt.getTime() + test.durationMinutes * 60 * 1000);

    const activeAttempt = async () => {
      const [active] = await db
        .select({ id: attemptsTable.id })
        .from(attemptsTable)
        .where(
          and(
            eq(attemptsTable.userId, student.userId),
            eq(attemptsTable.testVersionId, test.versionId),
            eq(attemptsTable.status, "in_progress"),
          ),
        );
      return active?.id;
    };

    const attemptId = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(attemptsTable)
        .values({
          userId: student.userId,
          testVersionId: test.versionId,
          idempotencyKey,
          status: "in_progress",
          startedAt,
          deadline,
          ordering: { sections, assignments, ...(chosen ? { chosenSection: rulesOf(chosen).id } : {}) },
        })
        .returning({ id: attemptsTable.id });

      await tx.insert(auditLogTable).values({
        actorId: student.userId,
        action: "attempt.started",
        entityType: "attempt",
        entityId: created.id,
        details: { testId, testVersionId: test.versionId, deadline: deadline.toISOString(), ...(chosen ? { section } : {}) },
      });
      return created.id;
    }).catch(async (error: unknown) => {
      // The attempt_one_active index rejected a second start from another tab: resume the first.
      const existing = isUniqueViolation(error) ? await activeAttempt() : undefined;
      if (existing) return null;
      throw error;
    });

    if (!attemptId) return json({ ok: true, replay: true, attemptId: await activeAttempt() });
    return json({ ok: true, replay: false, attemptId }, 201);
  } catch (e) {
    return apiError(e);
  }
}

function isUniqueViolation(error: unknown) {
  const cause = error && typeof error === "object" && "cause" in error ? error.cause : error;
  return Boolean(cause && typeof cause === "object" && "code" in cause && cause.code === "23505");
}
