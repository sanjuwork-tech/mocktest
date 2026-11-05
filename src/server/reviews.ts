import "server-only";
import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { requireDb } from "@/db/client";
import {
  auditLogTable,
  questionBankTable,
  questionReviewsTable,
  questionRevisionsTable,
  testAssignmentsTable,
  testsTable,
  testVersionsTable,
  usersTable,
} from "@/db/schema";
import { ApiError } from "@/server/http";
import { loadPaper } from "@/server/student-tests";
import { paperStatus, questionState, type Verdict } from "@/app/admin/(dashboard)/review/status";

/**
 * The version of each catalog test that review is about: for a live test, the newest published
 * version (what students take); for a hidden test, its newest version.
 */
async function reviewVersions(where?: { testId?: string; publishedOnly?: boolean }) {
  return requireDb()
    .selectDistinctOn([testVersionsTable.testId], {
      testId: testsTable.id,
      title: testsTable.title,
      exam: testsTable.examSlug,
      subject: testsTable.subject,
      testNumber: testsTable.testNumber,
      published: testsTable.published,
      versionId: testVersionsTable.id,
      version: testVersionsTable.version,
    })
    .from(testVersionsTable)
    .innerJoin(testsTable, eq(testsTable.id, testVersionsTable.testId))
    .where(
      and(
        isNotNull(testsTable.examSlug),
        where?.testId ? eq(testsTable.id, where.testId) : undefined,
        where?.publishedOnly
          ? and(eq(testsTable.published, true), isNotNull(testVersionsTable.publishedAt))
          : undefined,
      ),
    )
    .orderBy(
      testVersionsTable.testId,
      sql`case when ${testsTable.published} and ${testVersionsTable.publishedAt} is not null then 0 else 1 end`,
      desc(testVersionsTable.version),
    );
}

/** Every paper under review with its progress; `mine` counts questions the given reviewer has answered. */
export async function reviewPaperList(reviewerId: string, { publishedOnly }: { publishedOnly: boolean }) {
  const db = requireDb();
  const versions = await reviewVersions({ publishedOnly });
  if (!versions.length) return [];

  // One row per question: did anyone say ok / issue, and has this reviewer answered.
  const perQuestion = db
    .select({
      versionId: testAssignmentsTable.testVersionId,
      hasOk: sql<boolean>`coalesce(bool_or(${questionReviewsTable.verdict} = 'ok'), false)`.as("has_ok"),
      hasIssue: sql<boolean>`coalesce(bool_or(${questionReviewsTable.verdict} = 'issue'), false)`.as("has_issue"),
      mine: sql<boolean>`coalesce(bool_or(${questionReviewsTable.reviewerId} = ${reviewerId}), false)`.as("mine"),
    })
    .from(testAssignmentsTable)
    .leftJoin(questionReviewsTable, eq(questionReviewsTable.revisionId, testAssignmentsTable.revisionId))
    .where(inArray(testAssignmentsTable.testVersionId, versions.map((v) => v.versionId)))
    .groupBy(testAssignmentsTable.testVersionId, testAssignmentsTable.revisionId)
    .as("q");
  const counts = await db
    .select({
      versionId: perQuestion.versionId,
      total: sql<number>`count(*)::int`,
      issues: sql<number>`(count(*) filter (where ${perQuestion.hasIssue}))::int`,
      verified: sql<number>`(count(*) filter (where ${perQuestion.hasOk} and not ${perQuestion.hasIssue}))::int`,
      mine: sql<number>`(count(*) filter (where ${perQuestion.mine}))::int`,
    })
    .from(perQuestion)
    .groupBy(perQuestion.versionId);
  const byVersion = new Map(counts.map((c) => [c.versionId, c]));

  return versions
    .map((v) => {
      const c = byVersion.get(v.versionId) ?? { total: 0, issues: 0, verified: 0, mine: 0 };
      return { ...v, total: c.total, verified: c.verified, issues: c.issues, mine: c.mine, status: paperStatus(c) };
    })
    .sort(
      (a, b) =>
        (a.exam ?? "").localeCompare(b.exam ?? "") ||
        (a.subject ?? "").localeCompare(b.subject ?? "") ||
        (a.testNumber ?? 0) - (b.testNumber ?? 0),
    );
}

export type ReviewEntry = {
  reviewerId: string;
  reviewerName: string;
  verdict: Verdict;
  comment: string | null;
  updatedAt: string;
};

async function reviewsFor(revisionIds: string[]) {
  if (!revisionIds.length) return new Map<string, ReviewEntry[]>();
  const rows = await requireDb()
    .select({
      revisionId: questionReviewsTable.revisionId,
      reviewerId: questionReviewsTable.reviewerId,
      reviewerName: usersTable.name,
      verdict: questionReviewsTable.verdict,
      comment: questionReviewsTable.comment,
      updatedAt: questionReviewsTable.updatedAt,
    })
    .from(questionReviewsTable)
    .innerJoin(usersTable, eq(usersTable.id, questionReviewsTable.reviewerId))
    .where(inArray(questionReviewsTable.revisionId, revisionIds))
    .orderBy(questionReviewsTable.updatedAt);
  const map = new Map<string, ReviewEntry[]>();
  for (const { revisionId, updatedAt, ...r } of rows) {
    const list = map.get(revisionId) ?? [];
    list.push({ ...r, updatedAt: updatedAt.toISOString() });
    map.set(revisionId, list);
  }
  return map;
}

/** One paper with answer keys, each question's revision, external ID and every reviewer's verdict. */
export async function reviewPaper(testId: string, { publishedOnly }: { publishedOnly: boolean }) {
  const [version] = await reviewVersions({ testId, publishedOnly });
  if (!version) return null;
  const paper = await loadPaper(version.versionId, { includeKeys: true });

  const refs = await requireDb()
    .select({
      assignmentId: testAssignmentsTable.id,
      revisionId: testAssignmentsTable.revisionId,
      externalId: questionBankTable.externalId,
    })
    .from(testAssignmentsTable)
    .innerJoin(questionRevisionsTable, eq(questionRevisionsTable.id, testAssignmentsTable.revisionId))
    .innerJoin(questionBankTable, eq(questionBankTable.id, questionRevisionsTable.questionId))
    .where(eq(testAssignmentsTable.testVersionId, version.versionId));
  const refBy = new Map(refs.map((r) => [r.assignmentId, r]));
  const reviews = await reviewsFor(refs.map((r) => r.revisionId));
  const sectionName = new Map(paper.sections.map((s) => [s.id, s.name]));

  return {
    test: { ...paper.test, version: version.version, published: version.published },
    multiSection: paper.sections.length > 1,
    questions: paper.questions.map((q, i) => {
      const ref = refBy.get(q.assignmentId)!;
      return {
        ...q,
        number: i + 1,
        sectionName: sectionName.get(q.sectionId) ?? "",
        revisionId: ref.revisionId,
        externalId: ref.externalId,
        reviews: reviews.get(ref.revisionId) ?? [],
      };
    }),
  };
}

export type ReviewPaper = NonNullable<Awaited<ReturnType<typeof reviewPaper>>>;
export type ReviewQuestion = ReviewPaper["questions"][number];

/** Every open issue on the papers under review, for admins fixing the JSON. */
export async function openIssues() {
  const versions = await reviewVersions();
  if (!versions.length) return [];
  const rows = await requireDb()
    .select({
      versionId: testAssignmentsTable.testVersionId,
      revisionId: testAssignmentsTable.revisionId,
      externalId: questionBankTable.externalId,
      reviewerName: usersTable.name,
      comment: questionReviewsTable.comment,
      updatedAt: questionReviewsTable.updatedAt,
    })
    .from(questionReviewsTable)
    .innerJoin(testAssignmentsTable, eq(testAssignmentsTable.revisionId, questionReviewsTable.revisionId))
    .innerJoin(questionRevisionsTable, eq(questionRevisionsTable.id, questionReviewsTable.revisionId))
    .innerJoin(questionBankTable, eq(questionBankTable.id, questionRevisionsTable.questionId))
    .innerJoin(usersTable, eq(usersTable.id, questionReviewsTable.reviewerId))
    .where(
      and(
        eq(questionReviewsTable.verdict, "issue"),
        inArray(testAssignmentsTable.testVersionId, versions.map((v) => v.versionId)),
      ),
    )
    .orderBy(desc(questionReviewsTable.updatedAt));
  const versionBy = new Map(versions.map((v) => [v.versionId, v]));
  return rows.map(({ versionId, updatedAt, ...r }) => {
    const v = versionBy.get(versionId)!;
    return {
      ...r,
      updatedAt: updatedAt.toISOString(),
      testId: v.testId,
      title: v.title,
      exam: v.exam,
      subject: v.subject,
      testNumber: v.testNumber,
      version: v.version,
    };
  });
}

/**
 * Records (or changes) one reviewer's verdict on a question revision and audits it.
 * Returns every verdict on that revision so the screen can refresh in place.
 */
export async function saveVerdict(
  actorId: string,
  input: { revisionId: string; verdict: Verdict; comment: string | null },
  { publishedOnly }: { publishedOnly: boolean },
) {
  const db = requireDb();
  await db.transaction(async (tx) => {
    // Only questions that are part of a catalog paper can be reviewed (and, for reviewers, a live one).
    const [inPaper] = await tx
      .select({ id: testAssignmentsTable.id })
      .from(testAssignmentsTable)
      .innerJoin(testVersionsTable, eq(testVersionsTable.id, testAssignmentsTable.testVersionId))
      .innerJoin(testsTable, eq(testsTable.id, testVersionsTable.testId))
      .where(
        and(
          eq(testAssignmentsTable.revisionId, input.revisionId),
          isNotNull(testsTable.examSlug),
          publishedOnly ? and(eq(testsTable.published, true), isNotNull(testVersionsTable.publishedAt)) : undefined,
        ),
      )
      .limit(1);
    if (!inPaper) throw new ApiError(404, "Question not found in a paper under review.");

    const [previous] = await tx
      .select({ verdict: questionReviewsTable.verdict })
      .from(questionReviewsTable)
      .where(and(eq(questionReviewsTable.revisionId, input.revisionId), eq(questionReviewsTable.reviewerId, actorId)));

    const [saved] = await tx
      .insert(questionReviewsTable)
      .values({ revisionId: input.revisionId, reviewerId: actorId, verdict: input.verdict, comment: input.comment })
      .onConflictDoUpdate({
        target: [questionReviewsTable.revisionId, questionReviewsTable.reviewerId],
        set: { verdict: input.verdict, comment: input.comment, updatedAt: new Date() },
      })
      .returning({ id: questionReviewsTable.id });

    await tx.insert(auditLogTable).values({
      actorId,
      action: "question.review_saved",
      entityType: "question_revision",
      entityId: input.revisionId,
      details: { reviewId: saved.id, verdict: input.verdict, previousVerdict: previous?.verdict ?? null },
    });
  });
  const reviews = (await reviewsFor([input.revisionId])).get(input.revisionId) ?? [];
  return { reviews, state: questionState(reviews.map((r) => r.verdict)) };
}
