import { logout, ADMIN_COOKIE } from "@/server/auth";
import { apiError, json, requireOrigin } from "@/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    await logout();
    const response = json({ ok: true });
    response.cookies.delete(ADMIN_COOKIE);
    return response;
  } catch (e) {
    return apiError(e);
  }
}
