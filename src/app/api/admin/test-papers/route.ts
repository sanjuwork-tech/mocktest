import { z } from "zod";
import { count, desc, eq, isNotNull, max } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { canPublish } from "@/server/security";
import { requireDb } from "@/db/client";
import { testsTable, testVersionsTable } from "@/db/schema";
import { testPaperSchema } from "@/lib/question-bank-schema";
import { checkPaper, importTestPaper, paperTitle } from "@/server/test-papers";

export const runtime = "nodejs";

const uploadSchema = z.object({
  paper: z.unknown(),
  publish: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

/** GET /api/admin/test-papers — every catalog test, published or not. */
export async function GET() {
  try {
    await requireAdmin(["editor", "reviewer", "admin"]);
    const db = requireDb();
    const versions = db
      .select({
        testId: testVersionsTable.testId,
        versions: count(testVersionsTable.id).as("versions"),
        latestVersion: max(testVersionsTable.version).as("latest_version"),
      })
      .from(testVersionsTable)
      .groupBy(testVersionsTable.testId)
      .as("v");
    const tests = await db
      .select({
        testId: testsTable.id,
        title: testsTable.title,
        exam: testsTable.examSlug,
        subject: testsTable.subject,
        testNumber: testsTable.testNumber,
        isFree: testsTable.isFree,
        published: testsTable.published,
        versions: versions.versions,
        latestVersion: versions.latestVersion,
      })
      .from(testsTable)
      .leftJoin(versions, eq(versions.testId, testsTable.id))
      .where(isNotNull(testsTable.examSlug))
      .orderBy(testsTable.examSlug, testsTable.subject, testsTable.testNumber, desc(testsTable.createdAt));
    return json({ tests });
  } catch (e) {
    return apiError(e);
  }
}

/**
 * POST /api/admin/test-papers — validate (dryRun) or import one test paper.
 * Importing always creates a new immutable version; publishing needs the reviewer or admin role.
 */
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["editor", "reviewer", "admin"]);
    const body = uploadSchema.safeParse(await readJson(request, 5 * 1024 * 1024));
    if (!body.success) throw new ApiError(400, "Send { paper, publish, dryRun }.");

    const parsed = testPaperSchema.safeParse(body.data.paper);
    if (!parsed.success)
      return json(
        {
          ok: false,
          issues: parsed.error.issues.slice(0, 25).map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        422,
      );

    const { blueprint, issues } = checkPaper(parsed.data);
    if (!blueprint) return json({ ok: false, issues: issues.slice(0, 25) }, 422);

    const summary = {
      title: paperTitle(parsed.data),
      exam: parsed.data.exam,
      subject: parsed.data.subject ?? null,
      testNumber: parsed.data.testNumber,
      free: parsed.data.free,
      questions: parsed.data.questions.length,
      pattern: `${blueprint.totalQuestions} questions · ${blueprint.durationMinutes} min · ${blueprint.totalMarks} marks`,
    };
    if (body.data.dryRun) return json({ ok: true, dryRun: true, summary });

    if (body.data.publish && !canPublish(admin.role))
      throw new ApiError(403, "Only reviewers and admins can publish. Import it as a draft instead.");

    const result = await importTestPaper(requireDb(), parsed.data, blueprint, admin.userId, {
      publish: body.data.publish,
    });
    return json({ ok: true, summary, result });
  } catch (e) {
    return apiError(e);
  }
}
