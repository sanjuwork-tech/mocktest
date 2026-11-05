import { requireAdmin } from "@/server/auth";
import { apiError, json } from "@/server/http";
import { openIssues } from "@/server/reviews";

export const runtime = "nodejs";

/** GET /api/admin/reviews/issues — every open issue with its comment, so the paper JSON can be fixed and re-uploaded. */
export async function GET() {
  try {
    await requireAdmin(["editor", "admin"]);
    return json({ issues: await openIssues() });
  } catch (e) {
    return apiError(e);
  }
}
