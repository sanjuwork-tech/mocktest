import { apiError, ApiError, json } from "@/server/http";
import { finalizeOverdueAttempts } from "@/server/deadline";

export const runtime = "nodejs";

/**
 * POST /api/cron/finalize — Deadline enforcement cron
 *
 * Scans for overdue attempts and finalizes them as timed_out.
 * Authenticated with CRON_SECRET environment variable.
 */
export async function POST(request: Request) {
  try {
    const secret = request.headers.get("authorization")?.replace("Bearer ", "");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || secret !== cronSecret) {
      throw new ApiError(401, "Unauthorized.");
    }

    const finalized = await finalizeOverdueAttempts();

    return json({
      ok: true,
      finalized,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return apiError(e);
  }
}
