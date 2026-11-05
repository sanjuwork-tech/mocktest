import { z } from "zod";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json } from "@/server/http";
import { reviewPaper } from "@/server/reviews";

export const runtime = "nodejs";

/** GET /api/admin/reviews/:testId — a paper's questions with answer keys and every reviewer's verdict. */
export async function GET(_request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const user = await requireAdmin(["reviewer", "editor", "admin"]);
    const { testId } = await params;
    if (!z.uuid().safeParse(testId).success) throw new ApiError(400, "Invalid test ID.");
    const paper = await reviewPaper(testId, { publishedOnly: user.role === "reviewer" });
    if (!paper) throw new ApiError(404, "Paper not found.");
    return json({ paper });
  } catch (e) {
    return apiError(e);
  }
}
