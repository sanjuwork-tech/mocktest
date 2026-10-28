import { z } from "zod";
import { desc } from "drizzle-orm";
import { requireAdmin, rateLimit } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { normalizeEmail, tokenHash } from "@/server/security";
import { requireDb } from "@/db/client";
import { waitlistTable } from "@/db/schema";

export const runtime = "nodejs";

const INTERESTS = [
  "cuet-ug",
  "iiser-iat",
  "niser-nest",
  "comedk",
  "all",
  "all-access",
  "bundle-cuet-iiser",
  "bundle-science-trio",
] as const;

const joinSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  exam: z.enum(INTERESTS, { message: "Please choose what you'd like to hear about." }),
  source: z.string().trim().max(60).optional(),
});

/** POST /api/waitlist — join the waitlist for an exam's mock series. */
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const parsed = joinSchema.safeParse(await readJson(request, 4096));
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid request.");

    // Per-client limit, keyed by a hash of the forwarded IP so raw addresses are never stored.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await rateLimit("waitlist:" + tokenHash(ip), 10, 60 * 60);

    const db = requireDb();
    const inserted = await db
      .insert(waitlistTable)
      .values({
        email: normalizeEmail(parsed.data.email),
        interest: parsed.data.exam,
        source: parsed.data.source || "website",
      })
      .onConflictDoNothing()
      .returning({ id: waitlistTable.id });

    return inserted.length
      ? json({ success: true, message: "You're on the list! We'll email you when enrolment opens." }, 201)
      : json({ success: true, alreadyExists: true, message: "You're already on the list — we'll email you when enrolment opens." });
  } catch (e) {
    return apiError(e);
  }
}

/** GET /api/waitlist — admin-only CSV export. */
export async function GET() {
  try {
    await requireAdmin(["admin"]);
    const rows = await requireDb().select().from(waitlistTable).orderBy(desc(waitlistTable.createdAt));
    const escape = (v: string) => `"${v.replaceAll('"', '""')}"`;
    const csv = [
      "email,interest,source,joined_at",
      ...rows.map((r) => [r.email, r.interest, r.source, r.createdAt.toISOString()].map(escape).join(",")),
    ].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
