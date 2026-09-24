import { json } from "@/server/http";

export const runtime = "nodejs";

/**
 * GET /api/time — Server time authority
 *
 * Returns the current server time for client clock offset calculation.
 * Students use: serverOffset = serverNow - clientNow
 * Timer displays: clientNow + serverOffset
 */
export async function GET() {
  return json(
    { serverNow: new Date().toISOString() },
    200,
  );
}
