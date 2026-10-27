import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { requireStudent } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { finalizeIfOverdue } from "@/server/deadline";
import {
  attemptsTable,
  attemptAnswersTable,
  testAssignmentsTable,
  questionOptionsTable,
} from "@/db/schema";

export const runtime = "nodejs";

const answerSchema = z.object({
  answers: z
    .array(
      z.object({
        assignmentId: z.string().uuid(),
        // Option ID of the chosen answer; null clears the response.
        value: z.string().min(1).max(100).nullable(),
        expectedSequence: z.number().int().min(0),
        marked: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(200),
});

type SaveResult = {
  assignmentId: string;
  status: "saved" | "conflict" | "error";
  sequence?: number;
  value?: unknown;
  marked?: boolean;
  message?: string;
};

/**
 * PATCH /api/attempts/:id/answers — Save answers with conflict-safe versioning.
 *
 * Each answer carries the sequence the client last saw. A stale write is reported as a
 * conflict together with the stored value, so the client can adopt the server's state.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireOrigin(request);
    const student = await requireStudent();
    const { id: attemptId } = await params;

    const parsed = answerSchema.safeParse(await readJson(request, 65536));
    if (!parsed.success) throw new ApiError(400, "Invalid answer data.");

    const db = requireDb();
    if (await finalizeIfOverdue(attemptId))
      throw new ApiError(410, "Time is up. Your saved answers have been submitted.");

    const results = await db.transaction(async (tx) => {
      // Locking the attempt makes saves and submission mutually exclusive.
      const [attempt] = await tx
        .select()
        .from(attemptsTable)
        .where(eq(attemptsTable.id, attemptId))
        .for("update");
      if (!attempt || attempt.userId !== student.userId)
        throw new ApiError(404, "Attempt not found.");
      if (attempt.status !== "in_progress")
        throw new ApiError(409, "This attempt has already been submitted.");
      if (new Date() > attempt.deadline)
        throw new ApiError(410, "Time is up. Your saved answers have been submitted.");

      const ids = [...new Set(parsed.data.answers.map((a) => a.assignmentId))];
      const assignments = await tx
        .select({ id: testAssignmentsTable.id, revisionId: testAssignmentsTable.revisionId })
        .from(testAssignmentsTable)
        .where(
          and(
            eq(testAssignmentsTable.testVersionId, attempt.testVersionId),
            inArray(testAssignmentsTable.id, ids),
          ),
        );
      const revisionByAssignment = new Map(assignments.map((a) => [a.id, a.revisionId]));
      const options = assignments.length
        ? await tx
            .select({ revisionId: questionOptionsTable.revisionId, key: questionOptionsTable.optionKey })
            .from(questionOptionsTable)
            .where(inArray(questionOptionsTable.revisionId, assignments.map((a) => a.revisionId)))
        : [];
      const validOptions = new Set(options.map((o) => `${o.revisionId}:${o.key}`));

      const existingRows = await tx
        .select()
        .from(attemptAnswersTable)
        .where(and(eq(attemptAnswersTable.attemptId, attemptId), inArray(attemptAnswersTable.assignmentId, ids)));
      const existing = new Map(existingRows.map((r) => [r.assignmentId, r]));

      const out: SaveResult[] = [];
      for (const ans of parsed.data.answers) {
        const revisionId = revisionByAssignment.get(ans.assignmentId);
        if (!revisionId) {
          out.push({ assignmentId: ans.assignmentId, status: "error", message: "Question not in this test." });
          continue;
        }
        if (ans.value !== null && !validOptions.has(`${revisionId}:${ans.value}`)) {
          out.push({ assignmentId: ans.assignmentId, status: "error", message: "Unknown option." });
          continue;
        }

        const current = existing.get(ans.assignmentId);
        const currentSequence = current?.sequence ?? 0;
        if (ans.expectedSequence !== currentSequence) {
          out.push({
            assignmentId: ans.assignmentId,
            status: "conflict",
            sequence: currentSequence,
            value: current?.value ?? null,
            marked: current?.marked ?? false,
          });
          continue;
        }

        const sequence = currentSequence + 1;
        // The column is NOT NULL jsonb, so a cleared answer is stored as JSON null.
        const value = ans.value === null ? sql`'null'::jsonb` : ans.value;
        const marked = ans.marked ?? current?.marked ?? false;
        if (current) {
          await tx
            .update(attemptAnswersTable)
            .set({ value, sequence, marked, updatedAt: new Date() })
            .where(
              and(
                eq(attemptAnswersTable.attemptId, attemptId),
                eq(attemptAnswersTable.assignmentId, ans.assignmentId),
              ),
            );
        } else {
          await tx.insert(attemptAnswersTable).values({
            attemptId,
            assignmentId: ans.assignmentId,
            testVersionId: attempt.testVersionId,
            value,
            sequence,
            marked,
          });
        }
        out.push({ assignmentId: ans.assignmentId, status: "saved", sequence });
      }
      return out;
    });

    return json({ ok: true, serverNow: new Date().toISOString(), results });
  } catch (e) {
    return apiError(e);
  }
}
