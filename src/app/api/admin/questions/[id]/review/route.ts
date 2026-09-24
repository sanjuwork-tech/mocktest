import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { questionRevisionsTable, auditLogTable } from "@/db/schema";

export const runtime = "nodejs";

const reviewBodySchema = z.object({
  status: z.enum(["draft", "in_review", "approved", "retired"]),
  note: z.string().max(1000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireOrigin(request);
    // Only reviewers and administrators can change academic review status
    const admin = await requireAdmin(["reviewer", "admin"]);
    const { id: revisionId } = await params;

    const body = await readJson(request, 16 * 1024);
    const parsed = reviewBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid review status request.");
    }

    const db = requireDb();

    // Verify revision exists
    const [existing] = await db
      .select({
        id: questionRevisionsTable.id,
        questionId: questionRevisionsTable.questionId,
        revision: questionRevisionsTable.revision,
        status: questionRevisionsTable.status,
      })
      .from(questionRevisionsTable)
      .where(eq(questionRevisionsTable.id, revisionId));

    if (!existing) {
      throw new ApiError(404, "Question revision not found.");
    }

    const previousStatus = existing.status;

    // Update revision status and reviewer
    const [updated] = await db
      .update(questionRevisionsTable)
      .set({
        status: parsed.data.status,
        reviewedBy: admin.userId,
      })
      .where(eq(questionRevisionsTable.id, revisionId))
      .returning({
        id: questionRevisionsTable.id,
        status: questionRevisionsTable.status,
        reviewedBy: questionRevisionsTable.reviewedBy,
      });

    // Record in audit log
    await db.insert(auditLogTable).values({
      actorId: admin.userId,
      action: "question.reviewed",
      entityType: "question_revision",
      entityId: revisionId,
      details: {
        previousStatus,
        newStatus: parsed.data.status,
        note: parsed.data.note || null,
      },
    });

    return json({
      ok: true,
      revisionId: updated.id,
      status: updated.status,
      reviewedBy: updated.reviewedBy,
    });
  } catch (e) {
    return apiError(e);
  }
}
