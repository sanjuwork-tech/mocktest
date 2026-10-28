import "server-only";
import { and, desc, eq, gt, inArray, isNotNull, isNull, lte, or } from "drizzle-orm";
import { requireDb } from "@/db/client";
import {
  answerKeysTable,
  attemptResultsTable,
  attemptsTable,
  entitlementsTable,
  questionOptionsTable,
  questionRevisionsTable,
  testAssignmentsTable,
  testSectionsTable,
  testsTable,
  testVersionsTable,
} from "@/db/schema";

export type TestAccess = "free" | "unlocked" | "locked";

/** Products the student can currently use (trial, admin grant or payment). */
export async function activeProductIds(userId: string) {
  const db = requireDb();
  const now = new Date();
  const rows = await db
    .select({ productId: entitlementsTable.productId })
    .from(entitlementsTable)
    .where(
      and(
        eq(entitlementsTable.userId, userId),
        isNull(entitlementsTable.revokedAt),
        lte(entitlementsTable.startsAt, now),
        or(isNull(entitlementsTable.expiresAt), gt(entitlementsTable.expiresAt, now)),
      ),
    );
  return new Set(rows.map((r) => r.productId));
}

export function accessFor(
  test: { isFree: boolean; productId: string },
  products: Set<string>,
): TestAccess {
  if (test.isFree) return "free";
  return products.has(test.productId) ? "unlocked" : "locked";
}

/** Published catalog tests with the id of their newest published version. */
export async function publishedTests(where?: { testId?: string }) {
  const db = requireDb();
  const rows = await db
    .select({
      testId: testsTable.id,
      productId: testsTable.productId,
      title: testsTable.title,
      exam: testsTable.examSlug,
      subject: testsTable.subject,
      testNumber: testsTable.testNumber,
      isFree: testsTable.isFree,
      durationMinutes: testsTable.durationMinutes,
      totalMarks: testsTable.totalMarks,
      versionId: testVersionsTable.id,
      version: testVersionsTable.version,
    })
    .from(testsTable)
    .innerJoin(
      testVersionsTable,
      and(eq(testVersionsTable.testId, testsTable.id), isNotNull(testVersionsTable.publishedAt)),
    )
    .where(
      and(
        eq(testsTable.published, true),
        isNotNull(testsTable.examSlug),
        where?.testId ? eq(testsTable.id, where.testId) : undefined,
      ),
    )
    .orderBy(testsTable.examSlug, testsTable.subject, testsTable.testNumber, desc(testVersionsTable.version));

  // Keep only the newest published version of each test.
  const seen = new Set<string>();
  return rows.filter((r) => !seen.has(r.testId) && seen.add(r.testId));
}

/** The student's attempts, newest first, with scores once results exist. */
export async function studentAttempts(userId: string, testIds?: string[]) {
  const db = requireDb();
  return db
    .select({
      attemptId: attemptsTable.id,
      testId: testVersionsTable.testId,
      title: testVersionsTable.title,
      status: attemptsTable.status,
      startedAt: attemptsTable.startedAt,
      deadline: attemptsTable.deadline,
      submittedAt: attemptsTable.submittedAt,
      score: attemptResultsTable.score,
      maxScore: attemptResultsTable.maxScore,
    })
    .from(attemptsTable)
    .innerJoin(testVersionsTable, eq(testVersionsTable.id, attemptsTable.testVersionId))
    .leftJoin(attemptResultsTable, eq(attemptResultsTable.attemptId, attemptsTable.id))
    .where(
      and(
        eq(attemptsTable.userId, userId),
        testIds?.length ? inArray(testVersionsTable.testId, testIds) : undefined,
      ),
    )
    .orderBy(desc(attemptsTable.startedAt));
}

type Block = unknown;

export type PaperQuestion = {
  assignmentId: string;
  sectionId: string;
  position: number;
  marks: number;
  penalty: number;
  /** Released with the answer key only; never sent during a test. */
  topics?: string[];
  difficulty?: string | null;
  content: Block[];
  options: { key: string; content: Block[] }[];
  correctOptionId?: string;
  explanation?: Block[];
};

/**
 * Sections and questions of a test version in exam order.
 * Answer keys are read only when `includeKeys` is set — never for an attempt in progress.
 */
export async function loadPaper(testVersionId: string, { includeKeys }: { includeKeys: boolean }) {
  const db = requireDb();
  const [version] = await db
    .select({
      testId: testVersionsTable.testId,
      title: testVersionsTable.title,
      durationSeconds: testVersionsTable.durationSeconds,
      rules: testVersionsTable.rules,
    })
    .from(testVersionsTable)
    .where(eq(testVersionsTable.id, testVersionId));
  if (!version) throw new Error("Test version not found.");

  const [test] = await db
    .select({ exam: testsTable.examSlug, subject: testsTable.subject, testNumber: testsTable.testNumber })
    .from(testsTable)
    .where(eq(testsTable.id, version.testId));

  const sections = await db
    .select({ id: testSectionsTable.id, subject: testSectionsTable.subject, position: testSectionsTable.position, rules: testSectionsTable.rules })
    .from(testSectionsTable)
    .where(eq(testSectionsTable.testVersionId, testVersionId))
    .orderBy(testSectionsTable.position);

  const rows = await db
    .select({
      assignmentId: testAssignmentsTable.id,
      sectionId: testAssignmentsTable.sectionId,
      position: testAssignmentsTable.position,
      marks: testAssignmentsTable.marks,
      penalty: testAssignmentsTable.penalty,
      revisionId: testAssignmentsTable.revisionId,
      topics: questionRevisionsTable.topics,
      difficulty: questionRevisionsTable.difficulty,
      content: questionRevisionsTable.content,
    })
    .from(testAssignmentsTable)
    .innerJoin(questionRevisionsTable, eq(questionRevisionsTable.id, testAssignmentsTable.revisionId))
    .where(eq(testAssignmentsTable.testVersionId, testVersionId));

  const revisionIds = rows.map((r) => r.revisionId);
  const options = revisionIds.length
    ? await db
        .select({ revisionId: questionOptionsTable.revisionId, key: questionOptionsTable.optionKey, content: questionOptionsTable.content })
        .from(questionOptionsTable)
        .where(inArray(questionOptionsTable.revisionId, revisionIds))
        .orderBy(questionOptionsTable.position)
    : [];
  const keys =
    includeKeys && revisionIds.length
      ? await db
          .select({ revisionId: answerKeysTable.revisionId, answer: answerKeysTable.answer, explanation: answerKeysTable.explanation })
          .from(answerKeysTable)
          .where(inArray(answerKeysTable.revisionId, revisionIds))
      : [];

  const optionsByRevision = new Map<string, { key: string; content: Block[] }[]>();
  for (const o of options) {
    const list = optionsByRevision.get(o.revisionId) ?? [];
    list.push({ key: o.key, content: o.content as Block[] });
    optionsByRevision.set(o.revisionId, list);
  }
  const keyByRevision = new Map(keys.map((k) => [k.revisionId, k]));
  const sectionOrder = new Map(sections.map((s) => [s.id, s.position]));

  const questions: PaperQuestion[] = rows
    .sort((a, b) => sectionOrder.get(a.sectionId)! - sectionOrder.get(b.sectionId)! || a.position - b.position)
    .map((r) => {
      const key = keyByRevision.get(r.revisionId);
      return {
        assignmentId: r.assignmentId,
        sectionId: r.sectionId,
        position: r.position,
        marks: r.marks,
        penalty: r.penalty,
        content: r.content as Block[],
        options: optionsByRevision.get(r.revisionId) ?? [],
        ...(key
          ? {
              topics: r.topics,
              difficulty: r.difficulty,
              correctOptionId: (key.answer as { correctOptionId: string }).correctOptionId,
              explanation: key.explanation as Block[],
            }
          : {}),
      };
    });

  return {
    test: {
      testId: version.testId,
      title: version.title,
      durationSeconds: version.durationSeconds,
      rules: version.rules,
      exam: test?.exam ?? null,
      subject: test?.subject ?? null,
      testNumber: test?.testNumber ?? null,
    },
    sections: sections.map((s) => ({
      id: s.id,
      subject: s.subject,
      name: (s.rules as { name?: string }).name ?? s.subject,
    })),
    questions,
  };
}
