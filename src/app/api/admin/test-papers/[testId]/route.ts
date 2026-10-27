import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import { auditLogTable, testsTable, testVersionsTable } from "@/db/schema";

export const runtime = "nodejs";

const patchSchema = z.object({ published: z.boolean() });

/**
 * PATCH /api/admin/test-papers/:testId — show or hide a test in the student catalog.
 * Publishing also publishes the newest draft version; attempts already made are unaffected.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["reviewer", "admin"]);
    const { testId } = await params;
    const body = patchSchema.safeParse(await readJson(request, 1024));
    if (!body.success) throw new ApiError(400, "Send { published: true | false }.");
    const db = requireDb();

    await db.transaction(async (tx) => {
      const [test] = await tx.select().from(testsTable).where(eq(testsTable.id, testId)).for("update");
      if (!test) throw new ApiError(404, "Test not found.");

      if (body.data.published) {
        const [latest] = await tx
          .select()
          .from(testVersionsTable)
          .where(eq(testVersionsTable.testId, testId))
          .orderBy(desc(testVersionsTable.version))
          .limit(1);
        if (!latest) throw new ApiError(409, "This test has no versions to publish.");
        await tx
          .update(testVersionsTable)
          .set({ publishedAt: new Date() })
          .where(and(eq(testVersionsTable.id, latest.id), isNull(testVersionsTable.publishedAt)));
      }

      await tx.update(testsTable).set({ published: body.data.published }).where(eq(testsTable.id, testId));
      await tx.insert(auditLogTable).values({
        actorId: admin.userId,
        action: body.data.published ? "test.published" : "test.unpublished",
        entityType: "test",
        entityId: testId,
      });
    });
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
