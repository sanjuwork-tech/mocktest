import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { finalizeIfOverdue } from "@/server/deadline";
import { attemptsTable, attemptAnswersTable, testAssignmentsTable } from "@/db/schema";

export const runtime = "nodejs";

const answerSchema = z.object({
  answers: z.array(
    z.object({
      assignmentId: z.string().uuid(),
      value: z.unknown().nullable(), // null = clear response
      expectedSequence: z.number().int().min(0),
      marked: z.boolean().optional(),
    }),
  ).min(1).max(200),
});

/**
 * PATCH /api/attempts/:id/answers — Save answers with conflict-safe versioning
 *
 * Each answer has a monotonic sequence number. Stale writes (wrong expectedSequence)
 * return 409 with the authoritative current state.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireOrigin(request);
    const student = await requireStudent();
    const { id: attemptId } = await params;

    const body = await readJson(request, 65536); // Larger limit for batch saves
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Invalid answer data.", details: parsed.error.issues }, 400);
    }

    const db = requireDb();

    // 1. Verify ownership and status
    const [attempt] = await db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.id, attemptId));

    if (!attempt) throw new ApiError(404, "Attempt not found.");
    if (attempt.userId !== student.userId) {
      throw new ApiError(403, "You do not have access to this attempt.");
    }

    // 2. Check if overdue
    const timedOut = await finalizeIfOverdue(attemptId);
    if (timedOut) {
      throw new ApiError(410, "This attempt has timed out. Your previous answers have been saved.");
    }

    if (attempt.status !== "in_progress") {
      throw new ApiError(409, `Attempt is ${attempt.status}. No further answers can be saved.`);
    }

    // 3. Re-check deadline (server-authoritative)
    if (new Date() > attempt.deadline) {
      await finalizeIfOverdue(attemptId);
      throw new ApiError(410, "Time has expired. Your previous answers have been saved.");
    }

    // 4. Process each answer with optimistic concurrency
    const results: Array<{
      assignmentId: string;
      status: "saved" | "conflict" | "error";
      sequence?: number;
      message?: string;
    }> = [];

    for (const ans of parsed.data.answers) {
      // Verify the assignment belongs to this test version
      const [assignment] = await db
        .select({ id: testAssignmentsTable.id })
        .from(testAssignmentsTable)
        .where(
          and(
            eq(testAssignmentsTable.id, ans.assignmentId),
            eq(testAssignmentsTable.testVersionId, attempt.testVersionId),
          ),
        );

      if (!assignment) {
        results.push({
          assignmentId: ans.assignmentId,
          status: "error",
          message: "Assignment not found in this test.",
        });
        continue;
      }

      // Check existing answer
      const [existing] = await db
        .select({
          sequence: attemptAnswersTable.sequence,
          value: attemptAnswersTable.value,
          marked: attemptAnswersTable.marked,
        })
        .from(attemptAnswersTable)
        .where(
          and(
            eq(attemptAnswersTable.attemptId, attemptId),
            eq(attemptAnswersTable.assignmentId, ans.assignmentId),
          ),
        );

      if (existing) {
        // Optimistic concurrency check
        if (ans.expectedSequence !== existing.sequence) {
          results.push({
            assignmentId: ans.assignmentId,
            status: "conflict",
            sequence: existing.sequence,
            message: `Expected sequence ${ans.expectedSequence} but current is ${existing.sequence}.`,
          });
          continue;
        }

        // Update existing answer
        const newSequence = existing.sequence + 1;
        await db
          .update(attemptAnswersTable)
          .set({
            value: ans.value,
            sequence: newSequence,
            marked: ans.marked ?? existing.marked,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(attemptAnswersTable.attemptId, attemptId),
              eq(attemptAnswersTable.assignmentId, ans.assignmentId),
            ),
          );

        results.push({
          assignmentId: ans.assignmentId,
          status: "saved",
          sequence: newSequence,
        });
      } else {
        // First answer — expectedSequence must be 0
        if (ans.expectedSequence !== 0) {
          results.push({
            assignmentId: ans.assignmentId,
            status: "conflict",
            sequence: 0,
            message: "No previous answer exists. Expected sequence should be 0.",
          });
          continue;
        }

        await db.insert(attemptAnswersTable).values({
          attemptId,
          assignmentId: ans.assignmentId,
          testVersionId: attempt.testVersionId,
          value: ans.value,
          sequence: 1,
          marked: ans.marked ?? false,
        });

        results.push({
          assignmentId: ans.assignmentId,
          status: "saved",
          sequence: 1,
        });
      }
    }

    const hasConflicts = results.some((r) => r.status === "conflict");

    return json({
      ok: true,
      serverNow: new Date().toISOString(),
      results,
    }, hasConflicts ? 207 : 200); // 207 Multi-Status if mixed results
  } catch (e) {
    return apiError(e);
  }
}
