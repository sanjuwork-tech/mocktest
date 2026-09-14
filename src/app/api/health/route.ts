import { sql } from "drizzle-orm";
import { requireDb } from "@/db/client";
import { json } from "@/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireDb().execute(sql`select 1`);
    return json({ status: "ok", service: "testdisha", database: "reachable" });
  } catch {
    return json({ status: "unavailable", service: "testdisha" }, 503);
  }
}
