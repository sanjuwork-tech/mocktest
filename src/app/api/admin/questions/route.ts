import { desc, eq, and, sql, ilike } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, json, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import {
  questionBankTable,
  questionRevisionsTable,
  questionOptionsTable,
  answerKeysTable,
} from "@/db/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireOrigin(request);
    await requireAdmin(["editor", "reviewer", "admin"]);

    const url = new URL(request.url);
    const subject = url.searchParams.get("subject");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 200);
    const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);

    const db = requireDb();

    // Base query conditions
    const conditions = [];
    if (subject) {
      conditions.push(eq(questionRevisionsTable.subject, subject));
    }
    if (status) {
      conditions.push(eq(questionRevisionsTable.status, status));
    }
    if (search) {
      conditions.push(ilike(questionBankTable.externalId, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch revisions with their question externalId
    const revisions = await db
      .select({
        revisionId: questionRevisionsTable.id,
        questionId: questionBankTable.id,
        externalId: questionBankTable.externalId,
        revision: questionRevisionsTable.revision,
        type: questionRevisionsTable.type,
        subject: questionRevisionsTable.subject,
        topics: questionRevisionsTable.topics,
        content: questionRevisionsTable.content,
        status: questionRevisionsTable.status,
        source: questionRevisionsTable.source,
        createdAt: questionRevisionsTable.createdAt,
        reviewedBy: questionRevisionsTable.reviewedBy,
      })
      .from(questionRevisionsTable)
      .innerJoin(
        questionBankTable,
        eq(questionRevisionsTable.questionId, questionBankTable.id),
      )
      .where(whereClause)
      .orderBy(desc(questionRevisionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    if (revisions.length === 0) {
      return json({ questions: [], total: 0 });
    }

    const revisionIds = revisions.map((r) => r.revisionId);

    // Fetch options and answer keys for these revisions
    const [options, answerKeys] = await Promise.all([
      db
        .select()
        .from(questionOptionsTable)
        .where(
          sql`${questionOptionsTable.revisionId} IN (${sql.join(
            revisionIds.map((id) => sql`${id}::uuid`),
            sql`, `,
          )})`,
        )
        .orderBy(questionOptionsTable.position),
      db
        .select()
        .from(answerKeysTable)
        .where(
          sql`${answerKeysTable.revisionId} IN (${sql.join(
            revisionIds.map((id) => sql`${id}::uuid`),
            sql`, `,
          )})`,
        ),
    ]);

    const optionsByRev = new Map<string, typeof options>();
    for (const opt of options) {
      const list = optionsByRev.get(opt.revisionId) || [];
      list.push(opt);
      optionsByRev.set(opt.revisionId, list);
    }

    const answersByRev = new Map<string, (typeof answerKeys)[0]>();
    for (const ans of answerKeys) {
      answersByRev.set(ans.revisionId, ans);
    }

    const questions = revisions.map((rev) => {
      const ans = answersByRev.get(rev.revisionId);
      return {
        ...rev,
        options: optionsByRev.get(rev.revisionId) || [],
        answer: ans?.answer || null,
        explanation: ans?.explanation || null,
      };
    });

    return json({
      questions,
      count: questions.length,
      limit,
      offset,
    });
  } catch (e) {
    return apiError(e);
  }
}
