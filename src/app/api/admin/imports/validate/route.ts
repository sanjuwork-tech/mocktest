import { z } from "zod";
import { createHash } from "node:crypto";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { questionBankSchema } from "@/lib/question-bank-schema";
import { requireDb } from "@/db/client";
import { importsTable } from "@/db/schema";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

// Max 5MB file upload limit
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["admin", "reviewer", "editor"]);

    // Clone the request stream since we need the raw bytes for the checksum and the parsed JSON.
    // However, readJson handles the parsing and limits. We can just stringify it back for the checksum.
    // Alternatively, read raw bytes, compute checksum, then parse.
    const rawData = await readJson(request, MAX_FILE_SIZE);
    
    // Validate schema
    const parsed = questionBankSchema.safeParse(rawData);
    if (!parsed.success) {
      return json({ 
        error: "Invalid JSON format.", 
        details: parsed.error.issues 
      }, 400);
    }
    
    // Ensure all options have the correct option id present
    for (const q of parsed.data.questions) {
      if (!q.options.find(o => o.id === q.answer.correctOptionId)) {
        return json({
          error: `Question ${q.externalId} has a correctOptionId that does not exist in its options.`
        }, 400);
      }
    }

    // Compute checksum (normalized stringification to avoid minor whitespace differences)
    const checksum = createHash("sha256").update(JSON.stringify(parsed.data)).digest("hex");

    const db = requireDb();
    
    const [draft] = await db
      .insert(importsTable)
      .values({
        bundleId: parsed.data.bundleId,
        schemaVersion: parsed.data.schemaVersion,
        checksum,
        status: "draft",
        createdBy: admin.userId,
      })
      .onConflictDoUpdate({
        target: importsTable.checksum,
        set: { status: "draft" }
      })
      .returning();

    return json({
      ok: true,
      importId: draft.id,
      bundleId: parsed.data.bundleId,
      questionCount: parsed.data.questions.length,
      checksum,
    });
  } catch (e) {
    return apiError(e);
  }
}
