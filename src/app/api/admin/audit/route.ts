import { requireAdmin, recentAudit } from "@/server/auth";
import { apiError, json } from "@/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireAdmin(["admin"]);
    return json({ events: await recentAudit() });
  } catch (e) {
    return apiError(e);
  }
}
