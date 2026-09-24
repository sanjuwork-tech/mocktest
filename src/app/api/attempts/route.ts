import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { requireEntitlement } from "@/server/entitlements";
import {
  attemptsTable,
  testVersionsTable,
  testsTable,
  testSectionsTable,
  testAssignmentsTable,
  questionRevisionsTable,
  questionOptionsTable,
  auditLogTable,
} from "@/db/schema";

export const runtime = "nodejs";

const startSchema = z.object({
  testVersionId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(128),
});

/**
 * POST /api/attempts — Start a new test attempt
 *
 * Idempotent: replaying the same idempotencyKey returns the existing attempt
 * without granting extra time.
 */
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const student = await requireStudent();

    const body = await readJson(request, 16384);
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Invalid start request.", details: parsed.error.issues }, 400);
    }

    const db = requireDb();
    const { testVersionId, idempotencyKey } = parsed.data;

    // 1. Verify published test version
    const [version] = await db
      .select({
        id: testVersionsTable.id,
        testId: testVersionsTable.testId,
        title: testVersionsTable.title,
        durationSeconds: testVersionsTable.durationSeconds,
        rules: testVersionsTable.rules,
        publishedAt: testVersionsTable.publishedAt,
      })
      .from(testVersionsTable)
      .where(eq(testVersionsTable.id, testVersionId));

    if (!version || !version.publishedAt) {
      throw new ApiError(404, "Published test version not found.");
    }

    // 2. Verify entitlement
    const [test] = await db
      .select({ productId: testsTable.productId })
      .from(testsTable)
      .where(eq(testsTable.id, version.testId));

    if (!test) throw new ApiError(404, "Test not found.");
    await requireEntitlement(student.userId, test.productId);

    // 3. Check idempotency — return existing attempt if already started
    const [existingAttempt] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.idempotencyKey, idempotencyKey))
      .limit(1);

    if (existingAttempt) {
      if (existingAttempt.userId !== student.userId) {
        throw new ApiError(403, "This attempt belongs to another user.");
      }
      // Return existing attempt without granting extra time
      const content = await loadAttemptContent(db, existingAttempt.id, version.id);
      return json({
        ok: true,
        replay: true,
        attempt: {
          id: existingAttempt.id,
          status: existingAttempt.status,
          serverNow: new Date().toISOString(),
          deadline: existingAttempt.deadline.toISOString(),
          startedAt: existingAttempt.startedAt.toISOString(),
          ordering: existingAttempt.ordering,
        },
        test: {
          title: version.title,
          durationSeconds: version.durationSeconds,
          rules: version.rules,
        },
        ...content,
      });
    }

    // 4. Check for existing active attempt on this test version
    const [activeAttempt] = await db
      .select({ id: attemptsTable.id, status: attemptsTable.status })
      .from(attemptsTable)
      .where(
        and(
          eq(attemptsTable.userId, student.userId),
          eq(attemptsTable.testVersionId, testVersionId),
          eq(attemptsTable.status, "in_progress"),
        ),
      )
      .limit(1);

    if (activeAttempt) {
      throw new ApiError(409, "You already have an active attempt for this test. Complete or wait for it to expire.");
    }

    // 5. Build ordering snapshot (section order + question positions)
    const sections = await db
      .select({
        id: testSectionsTable.id,
        subject: testSectionsTable.subject,
        position: testSectionsTable.position,
        rules: testSectionsTable.rules,
      })
      .from(testSectionsTable)
      .where(eq(testSectionsTable.testVersionId, version.id))
      .orderBy(testSectionsTable.position);

    const assignments = await db
      .select({
        id: testAssignmentsTable.id,
        sectionId: testAssignmentsTable.sectionId,
        position: testAssignmentsTable.position,
      })
      .from(testAssignmentsTable)
      .where(eq(testAssignmentsTable.testVersionId, version.id))
      .orderBy(testAssignmentsTable.position);

    const ordering = {
      sections: sections.map((s) => ({
        id: s.id,
        subject: s.subject,
        position: s.position,
      })),
      assignments: assignments.map((a) => ({
        id: a.id,
        sectionId: a.sectionId,
        position: a.position,
      })),
    };

    // 6. Atomic attempt creation
    const serverNow = new Date();
    const deadline = new Date(serverNow.getTime() + version.durationSeconds * 1000);

    const [attempt] = await db.transaction(async (tx) => {
      const created = await tx
        .insert(attemptsTable)
        .values({
          userId: student.userId,
          testVersionId: version.id,
          idempotencyKey,
          status: "in_progress",
          startedAt: serverNow,
          deadline,
          ordering,
        })
        .returning();

      await tx.insert(auditLogTable).values({
        actorId: student.userId,
        action: "attempt.started",
        entityType: "attempt",
        entityId: created[0].id,
        details: {
          testVersionId: version.id,
          deadline: deadline.toISOString(),
        },
      });

      return created;
    });

    // 7. Load question content (without answer keys)
    const content = await loadAttemptContent(db, attempt.id, version.id);

    return json({
      ok: true,
      replay: false,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        serverNow: serverNow.toISOString(),
        deadline: deadline.toISOString(),
        startedAt: serverNow.toISOString(),
        ordering,
      },
      test: {
        title: version.title,
        durationSeconds: version.durationSeconds,
        rules: version.rules,
      },
      ...content,
    }, 201);
  } catch (e) {
    return apiError(e);
  }
}

/**
 * Loads question content for an attempt — NEVER includes answer keys.
 */
async function loadAttemptContent(db: ReturnType<typeof requireDb>, attemptId: string, testVersionId: string) {
  const sections = await db
    .select({
      id: testSectionsTable.id,
      subject: testSectionsTable.subject,
      position: testSectionsTable.position,
      rules: testSectionsTable.rules,
    })
    .from(testSectionsTable)
    .where(eq(testSectionsTable.testVersionId, testVersionId))
    .orderBy(testSectionsTable.position);

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
    .where(eq(testAssignmentsTable.testVersionId, testVersionId))
    .orderBy(testAssignmentsTable.position);

  // Load revision content and options (NO answer keys)
  const revisionIds = assignments.map((a) => a.revisionId);
  if (revisionIds.length === 0) {
    return { sections, questions: [] };
  }

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

  const revisionMap = new Map(revisions.map((r) => [r.id, r]));
  const optionMap = new Map<string, typeof options>();
  for (const opt of options) {
    const list = optionMap.get(opt.revisionId) || [];
    list.push(opt);
    optionMap.set(opt.revisionId, list);
  }

  const questions = assignments.map((a) => {
    const rev = revisionMap.get(a.revisionId);
    return {
      assignmentId: a.id,
      sectionId: a.sectionId,
      position: a.position,
      marks: a.marks,
      penalty: a.penalty,
      type: rev?.type ?? "single_choice",
      subject: rev?.subject ?? "",
      content: rev?.content ?? [],
      options: (optionMap.get(a.revisionId) || []).map((o) => ({
        key: o.optionKey,
        position: o.position,
        content: o.content,
      })),
    };
  });

  return { sections, questions };
}
