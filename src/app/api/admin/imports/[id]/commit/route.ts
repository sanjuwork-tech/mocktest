import { createHash } from "node:crypto";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { questionBankSchema } from "@/lib/question-bank-schema";
import { requireDb } from "@/db/client";
import { importsTable, questionBankTable, questionRevisionsTable, questionOptionsTable, answerKeysTable, importItemsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["admin", "reviewer", "editor"]);
    const { id: importId } = await params;

    const rawData = await readJson(request, MAX_FILE_SIZE);
    
    // Validate schema again
    const parsed = questionBankSchema.safeParse(rawData);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid JSON format.");
    }

    const checksum = createHash("sha256").update(JSON.stringify(parsed.data)).digest("hex");

    const db = requireDb();

    // Start a transaction for the commit
    await db.transaction(async (tx) => {
      // 1. Verify the draft exists and matches the checksum
      const [draft] = await tx
        .select()
        .from(importsTable)
        .where(and(eq(importsTable.id, importId), eq(importsTable.checksum, checksum)))
        .for("update");

      if (!draft) {
        throw new ApiError(404, "Import draft not found or checksum mismatch.");
      }
      
      if (draft.status === "committed") {
        throw new ApiError(409, "This import has already been committed.");
      }

      // 2. Process each question
      for (const q of parsed.data.questions) {
        // Upsert into questionBankTable (create if not exists)
        let [qb] = await tx
          .select({ id: questionBankTable.id })
          .from(questionBankTable)
          .where(eq(questionBankTable.externalId, q.externalId));

        if (!qb) {
          [qb] = await tx
            .insert(questionBankTable)
            .values({ externalId: q.externalId })
            .returning({ id: questionBankTable.id });
        }

        // Figure out next revision number
        const prevRevs = await tx
          .select({ revision: questionRevisionsTable.revision })
          .from(questionRevisionsTable)
          .where(eq(questionRevisionsTable.questionId, qb.id))
          .orderBy(questionRevisionsTable.revision)
          .limit(100); // we just need max

        const nextRevision = prevRevs.length > 0 ? Math.max(...prevRevs.map(r => r.revision)) + 1 : 1;

        // Insert revision
        const [rev] = await tx
          .insert(questionRevisionsTable)
          .values({
            questionId: qb.id,
            revision: nextRevision,
            type: q.type,
            subject: q.subject,
            topics: q.topics,
            content: q.stem,
            status: "draft",
            source: q.source,
            createdBy: admin.userId,
          })
          .returning({ id: questionRevisionsTable.id });

        // Insert options
        const optionValues = q.options.map((opt, i) => ({
          revisionId: rev.id,
          optionKey: opt.id,
          position: i,
          content: opt.content,
        }));
        await tx.insert(questionOptionsTable).values(optionValues);

        // Insert answer key
        await tx.insert(answerKeysTable).values({
          revisionId: rev.id,
          answer: q.answer,
          explanation: q.explanation,
        });

        // Link import item
        await tx.insert(importItemsTable).values({
          importId: draft.id,
          externalId: q.externalId,
          revisionId: rev.id,
        });
      }

      // Mark import as committed
      await tx
        .update(importsTable)
        .set({ status: "committed" })
        .where(eq(importsTable.id, draft.id));
    });

    return json({ ok: true, message: "Import committed successfully." });
  } catch (e) {
    return apiError(e);
  }
}
