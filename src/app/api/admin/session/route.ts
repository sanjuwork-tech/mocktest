import { requireAdmin } from "@/server/auth";
import { apiError, json } from "@/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    const user = await requireAdmin();
    return json({ user });
  } catch (e) {
    return apiError(e);
  }
}
