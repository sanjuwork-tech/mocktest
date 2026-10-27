import { apiError, ApiError, json } from "@/server/http";
import { finalizeOverdueAttempts } from "@/server/deadline";
import { safeEqual } from "@/server/security";

export const runtime = "nodejs";

/**
 * GET|POST /api/cron/finalize — Deadline enforcement cron
 *
 * Scans for overdue attempts and finalizes them as timed_out.
 * Authenticated with CRON_SECRET (Vercel Cron sends it as a GET Bearer token).
 */
async function handle(request: Request) {
  try {
    const header = request.headers.get("authorization") ?? "";
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || !safeEqual(header, `Bearer ${cronSecret}`)) {
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

export const GET = handle;
export const POST = handle;
