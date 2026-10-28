import { sql } from "drizzle-orm";
import { databaseConfigured, requireDb } from "@/db/client";
import { json } from "@/server/http";
export const runtime = "nodejs";
// The newest table from the latest migration; if it is missing, migrations are behind.
const LATEST_TABLE = "attempt_question_stats";
export async function GET() {
  if (!databaseConfigured)
    return json({ status: "unavailable", service: "ourmocks", database: "not_configured" }, 503);
  try {
    const rows = await requireDb().execute(sql`select to_regclass(${"public." + LATEST_TABLE}) is not null as current`);
    const current = Boolean((rows as unknown as { current: boolean }[])[0]?.current);
    return json(
      { status: current ? "ok" : "degraded", service: "ourmocks", database: "reachable", schema: current ? "current" : "migrations_pending" },
      current ? 200 : 503,
    );
  } catch {
    return json({ status: "unavailable", service: "ourmocks", database: "unreachable" }, 503);
  }
}
