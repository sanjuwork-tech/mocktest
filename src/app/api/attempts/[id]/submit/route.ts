import { eq, and } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { attemptsTable, auditLogTable } from "@/db/schema";
import { processAttemptScoring } from "@/server/scoring";

export const runtime = "nodejs";

/**
 * POST /api/attempts/:id/submit — Manual submission
 *
 * Idempotent: repeated submit returns the same result.
 * Scoring is deferred to Phase 5 — this phase just finalizes the attempt.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireOrigin(request);
    const student = await requireStudent();
    const { id: attemptId } = await params;

    const db = requireDb();

    // 1. Verify ownership
    const [attempt] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId));

    if (!attempt) throw new ApiError(404, "Attempt not found.");
    if (attempt.userId !== student.userId) {
      throw new ApiError(403, "You do not have access to this attempt.");
    }

    // 2. Idempotent check — already submitted or timed out
    if (attempt.status === "submitted" || attempt.status === "timed_out") {
      return json({
        ok: true,
        replay: true,
        status: attempt.status,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        message: "This attempt has already been finalized.",
      });
    }

    if (attempt.status !== "in_progress") {
      throw new ApiError(409, `Cannot submit attempt with status "${attempt.status}".`);
    }

    // 3. Atomic submission
    const serverNow = new Date();

    await db.transaction(async (tx) => {
      // Lock the attempt row
      const [locked] = await tx
        .select()
        .from(attemptsTable)
        .where(
          and(
            eq(attemptsTable.id, attemptId),
            eq(attemptsTable.status, "in_progress"),
          ),
        )
        .for("update");

      if (!locked) {
        // Another process already finalized this attempt
        return;
      }

      await tx
        .update(attemptsTable)
        .set({
          status: "submitted",
          submittedAt: serverNow,
        })
        .where(eq(attemptsTable.id, attemptId));

      await tx.insert(auditLogTable).values({
        actorId: student.userId,
        action: "attempt.submitted",
        entityType: "attempt",
        entityId: attemptId,
        details: {
          testVersionId: attempt.testVersionId,
          submittedAt: serverNow.toISOString(),
          beforeDeadline: serverNow <= attempt.deadline,
        },
      });
    });

    // 4. Process Scoring
    await processAttemptScoring(attemptId);

    return json({
      ok: true,
      replay: false,
      status: "submitted",
      submittedAt: serverNow.toISOString(),
      message: "Test submitted successfully. Results are ready.",
    });
  } catch (e) {
    return apiError(e);
  }
}
