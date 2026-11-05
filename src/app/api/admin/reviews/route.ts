import { requireAdmin } from "@/server/auth";
import { apiError, json } from "@/server/http";
import { reviewPaperList } from "@/server/reviews";

export const runtime = "nodejs";

/** GET /api/admin/reviews — papers under expert review with progress. Reviewers see live papers only. */
export async function GET() {
  try {
    const user = await requireAdmin(["reviewer", "editor", "admin"]);
    const papers = await reviewPaperList(user.userId, { publishedOnly: user.role === "reviewer" });
    return json({ papers, role: user.role });
  } catch (e) {
    return apiError(e);
  }
}
