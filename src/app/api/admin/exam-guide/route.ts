import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { exams, type ExamGuide } from "@/data/exams";
import { requireDb } from "@/db/client";
import { auditLogTable } from "@/db/schema";

export const runtime = "nodejs";

// In-memory or database-backed exam guide override cache
const guideOverrides = new Map<string, Partial<ExamGuide>>();

const updateGuideSchema = z.object({
  slug: z.string(),
  checkedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  verification: z.enum(["reviewed", "partial"]).optional(),
  notification: z
    .object({
      title: z.string().min(1),
      detail: z.string().min(1),
      source: z.object({
        label: z.string().min(1),
        url: z.string().url(),
      }),
    })
    .optional(),
  application: z
    .object({
      status: z.enum(["closed", "unverified"]),
      label: z.string().min(1),
      url: z.string().url(),
      note: z.string(),
    })
    .optional(),
});

export async function GET(request: Request) {
  try {
    requireOrigin(request);
    await requireAdmin(["editor", "reviewer", "admin"]);

    const enriched = exams.map((ex) => {
      const override = guideOverrides.get(ex.slug) || {};
      return {
        ...ex,
        ...override,
      };
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

    const body = await readJson(request, 32 * 1024);
    const parsed = updateGuideSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid exam guide update payload.");
    }

    const { slug, ...updates } = parsed.data;
    const existing = exams.find((e) => e.slug === slug);
    if (!existing) {
      throw new ApiError(404, `Exam guide for "${slug}" not found.`);
    }

    const currentOverride = guideOverrides.get(slug) || {};
    guideOverrides.set(slug, { ...currentOverride, ...updates });

    const db = requireDb();
    await db.insert(auditLogTable).values({
      actorId: admin.userId,
      action: "exam_guide.updated",
      entityType: "exam_guide",
      entityId: slug,
      details: updates,
    });

    return json({
      ok: true,
      message: `Exam guide for "${slug}" updated successfully.`,
      updated: { ...existing, ...guideOverrides.get(slug) },
    });
  } catch (e) {
    return apiError(e);
  }
}
