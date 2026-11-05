import { z } from "zod";
import { currentStudent, rateLimit } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { normalizeEmail, tokenHash } from "@/server/security";
import { requireDb } from "@/db/client";
import { toolSubmissionsTable } from "@/db/schema";
import { SUBMISSION_LIMITS } from "@/lib/predictors/submissions";

export const runtime = "nodejs";

const value = z.union([z.string().trim().max(SUBMISSION_LIMITS.maxStringLength), z.number().finite(), z.boolean(), z.null()]);

const submissionSchema = z
  .object({
    tool: z.string().regex(/^[a-z0-9][a-z0-9-]{2,59}$/, "Unknown tool."),
    inputs: z
      .record(z.string().regex(/^[A-Za-z0-9_]{1,40}$/), value)
      .refine((o) => Object.keys(o).length <= SUBMISSION_LIMITS.maxKeys, "Too many inputs.")
      .refine((o) => Buffer.byteLength(JSON.stringify(o)) <= SUBMISSION_LIMITS.maxInputBytes, "Inputs are too large."),
    email: z.email("Please enter a valid email address.").max(254).optional(),
    consentBasis: z.enum(["adult", "guardian"]).optional(),
  })
  .strict()
  .refine((s) => !s.email || s.consentBasis, { message: "Please confirm you are 18 or older, or that a parent or guardian agrees." });

/**
 * POST /api/tools/submissions — record a predictor tool's inputs (no IP or name stored).
 * An email is kept only with a consent basis; signed-in students are linked by user id.
 */
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const parsed = submissionSchema.safeParse(await readJson(request, 4096));
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request.");

    // Per-client limit keyed by a hash of the forwarded IP, so raw addresses are never stored.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await rateLimit("tools:" + tokenHash(ip), 60, 60 * 60);

    const { tool, inputs, email, consentBasis } = parsed.data;
    const student = await currentStudent();
    await requireDb()
      .insert(toolSubmissionsTable)
      .values({
        tool,
        inputs,
        userId: student?.userId ?? null,
        ...(email && consentBasis ? { email: normalizeEmail(email), consentBasis, consentedAt: new Date() } : {}),
      });
    return json({ ok: true }, 201);
  } catch (e) {
    return apiError(e);
  }
}
