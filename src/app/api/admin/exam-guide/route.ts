import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { and, desc, eq } from "drizzle-orm";
import { exams } from "@/data/exams";
import { requireDb } from "@/db/client";
import { auditLogTable } from "@/db/schema";

export const runtime = "nodejs";

const verifySchema = z.object({ slug: z.string() });
const VERIFIED = "exam_guide.verified";

export async function GET(request: Request) {
  try {
    requireOrigin(request);
    await requireAdmin(["editor", "reviewer", "admin"]);

    // Verifications are kept in the audit log, so they survive restarts and show who checked what.
    const rows = await requireDb()
      .select({ slug: auditLogTable.entityId, at: auditLogTable.createdAt })
      .from(auditLogTable)
      .where(and(eq(auditLogTable.action, VERIFIED), eq(auditLogTable.entityType, "exam_guide")))
      .orderBy(desc(auditLogTable.createdAt))
      .limit(200);
    const enriched = exams.map((ex) => {
      const last = rows.find((r) => r.slug === ex.slug);
      return { ...ex, lastVerifiedOn: last ? last.at.toISOString().slice(0, 10) : null };
    });

    return json({ guides: enriched });
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["reviewer", "admin"]);

    const parsed = verifySchema.safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(400, "Invalid request.");
    const { slug } = parsed.data;
    if (!exams.some((e) => e.slug === slug)) throw new ApiError(404, "Exam guide not found.");

    const [row] = await requireDb()
      .insert(auditLogTable)
      .values({ actorId: admin.userId, action: VERIFIED, entityType: "exam_guide", entityId: slug })
      .returning({ at: auditLogTable.createdAt });
    return json({ ok: true, lastVerifiedOn: row.at.toISOString().slice(0, 10) });
  } catch (e) {
    return apiError(e);
  }
}
