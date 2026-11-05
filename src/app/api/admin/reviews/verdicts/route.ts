import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { saveVerdict } from "@/server/reviews";
import { normalizeVerdict } from "@/app/admin/(dashboard)/review/status";

export const runtime = "nodejs";

const verdictSchema = z
  .object({
    revisionId: z.uuid(),
    verdict: z.enum(["ok", "issue"]),
    comment: z.string().max(2000).nullish(),
  })
  .strict();

/** PUT /api/admin/reviews/verdicts — save or change the signed-in reviewer's verdict on one question. */
export async function PUT(request: Request) {
  try {
    requireOrigin(request);
    // Editors upload papers; verdicts come from reviewers (experts) and admins.
    const user = await requireAdmin(["reviewer", "admin"]);
    const body = verdictSchema.safeParse(await readJson(request, 8192));
    if (!body.success) throw new ApiError(400, "Send { revisionId, verdict: \"ok\" | \"issue\", comment }.");
    const normalized = normalizeVerdict(body.data.verdict, body.data.comment);
    if (!normalized) throw new ApiError(400, "Describe the issue so the paper can be fixed.");
    const result = await saveVerdict(
      user.userId,
      { revisionId: body.data.revisionId, ...normalized },
      { publishedOnly: user.role === "reviewer" },
    );
    return json({ ok: true, ...result });
  } catch (e) {
    return apiError(e);
  }
}
