import "server-only";
import { and, eq, sql, lte } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { attemptsTable, auditLogTable } from "@/db/schema";
import { processAttemptScoring } from "@/server/scoring";

const BATCH_SIZE = 50;

/**
 * Scans for overdue attempts and finalizes them as timed_out.
 * Uses FOR UPDATE SKIP LOCKED to prevent duplicate processing.
 * Returns the count of finalized attempts.
 */
export async function finalizeOverdueAttempts(): Promise<number> {
  const db = requireDb();
  let finalized = 0;
  const overdueAttemptIds: string[] = [];

  await db.transaction(async (tx) => {
    // Find attempts that are past their deadline and still in_progress
    const overdueAttempts = await tx
      .select({
        id: attemptsTable.id,
        userId: attemptsTable.userId,
        testVersionId: attemptsTable.testVersionId,
        deadline: attemptsTable.deadline,
      })
      .from(attemptsTable)
      .where(
        and(
          eq(attemptsTable.status, "in_progress"),
          lte(attemptsTable.deadline, sql`now()`),
        ),
      )
      .limit(BATCH_SIZE)
      .for("update", { skipLocked: true });

    for (const attempt of overdueAttempts) {
      await tx
        .update(attemptsTable)
        .set({
          status: "timed_out",
          submittedAt: attempt.deadline, // Submitted at the deadline, not now
        })
        .where(eq(attemptsTable.id, attempt.id));

      await tx.insert(auditLogTable).values({
        actorId: attempt.userId,
        action: "attempt.timed_out",
        entityType: "attempt",
        entityId: attempt.id,
        details: {
          testVersionId: attempt.testVersionId,
          deadline: attempt.deadline.toISOString(),
        },
      });

      overdueAttemptIds.push(attempt.id);
      finalized++;
    }
  });

  // Score the attempts outside the main batch transaction
  if (overdueAttemptIds.length > 0) {
    await Promise.allSettled(
      overdueAttemptIds.map((id) => processAttemptScoring(id))
    );
  }

  return finalized;
}

/**
 * Checks if a single attempt is overdue and finalizes it.
 * Called inline during answer saves to eagerly catch expired attempts.
 */
export async function finalizeIfOverdue(attemptId: string): Promise<boolean> {
  const db = requireDb();

  const [attempt] = await db
    .select({
      id: attemptsTable.id,
      status: attemptsTable.status,
      deadline: attemptsTable.deadline,
      userId: attemptsTable.userId,
      testVersionId: attemptsTable.testVersionId,
    })
    .from(attemptsTable)
    .where(eq(attemptsTable.id, attemptId));

  if (!attempt || attempt.status !== "in_progress") return false;
  if (new Date() <= attempt.deadline) return false;

  await db.transaction(async (tx) => {
    await tx
      .update(attemptsTable)
      .set({
        status: "timed_out",
        submittedAt: attempt.deadline,
      })
      .where(
        and(
          eq(attemptsTable.id, attempt.id),
          eq(attemptsTable.status, "in_progress"),
        ),
      );

    await tx.insert(auditLogTable).values({
      actorId: attempt.userId,
      action: "attempt.timed_out",
      entityType: "attempt",
      entityId: attempt.id,
      details: {
        testVersionId: attempt.testVersionId,
        deadline: attempt.deadline.toISOString(),
        trigger: "inline_check",
      },
    });
  });

  // Score the attempt outside the transaction
  await processAttemptScoring(attemptId).catch(console.error);

  return true;
}
