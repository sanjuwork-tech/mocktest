import { and, desc, eq, isNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema.ts";
import {
  answerKeysTable,
  auditLogTable,
  productsTable,
  questionBankTable,
  questionOptionsTable,
  questionRevisionsTable,
  testAssignmentsTable,
  testSectionsTable,
  testsTable,
  testVersionsTable,
} from "../db/schema.ts";
import { blueprintFor } from "../lib/blueprints/definitions.ts";
import type { ExamBlueprint } from "../lib/blueprints/types.ts";
import { EXAMS, SUBJECT_NAMES } from "../lib/exams/catalog.ts";
import type { QuestionInput, TestPaper } from "../lib/question-bank-schema.ts";

// No "server-only" import: the seed script runs this module under plain Node.

type Db = PostgresJsDatabase<typeof schema>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export type PaperIssue = { path: string; message: string };

/** Checks a parsed paper against its exam blueprint. Returns the blueprint when the paper is valid. */
export function checkPaper(paper: TestPaper): {
  blueprint?: ExamBlueprint;
  issues: PaperIssue[];
} {
  const issues: PaperIssue[] = [];
  const exam = EXAMS[paper.exam];

  if (exam.paperPerSubject && !paper.subject)
    issues.push({ path: "subject", message: `${exam.name} papers must name their subject.` });
  if (!exam.paperPerSubject && paper.subject)
    issues.push({ path: "subject", message: `${exam.name} papers cover all sections; omit "subject".` });
  if (paper.subject && !exam.subjects.includes(paper.subject))
    issues.push({ path: "subject", message: `${exam.name} does not include ${paper.subject}.` });
  if (paper.testNumber > exam.plannedTests)
    issues.push({ path: "testNumber", message: `${exam.name} plans ${exam.plannedTests} tests; got test ${paper.testNumber}.` });

  const blueprint = blueprintFor(paper.exam, paper.subject);
  if (!blueprint) return { issues };

  const seenIds = new Set<string>();
  paper.questions.forEach((q, i) => {
    const path = `questions[${i}]`;
    if (seenIds.has(q.externalId))
      issues.push({ path: `${path}.externalId`, message: `Duplicate question ID "${q.externalId}".` });
    seenIds.add(q.externalId);

    const optionIds = q.options.map((o) => o.id);
    if (new Set(optionIds).size !== optionIds.length)
      issues.push({ path: `${path}.options`, message: "Option IDs must be unique." });
    if (!optionIds.includes(q.answer.correctOptionId))
      issues.push({ path: `${path}.answer`, message: `Correct option "${q.answer.correctOptionId}" is not one of the options.` });
  });

  for (const section of blueprint.sections) {
    const count = paper.questions.filter((q) => q.subject === section.subject).length;
    if (count !== section.questionCount)
      issues.push({
        path: "questions",
        message: `${section.name} needs ${section.questionCount} questions; the paper has ${count}.`,
      });
  }
  const sectionSubjects = new Set<string>(blueprint.sections.map((s) => s.subject));
  paper.questions.forEach((q, i) => {
    if (!sectionSubjects.has(q.subject))
      issues.push({ path: `questions[${i}].subject`, message: `"${q.subject}" is not a section of this paper.` });
  });

  return issues.length ? { issues } : { blueprint, issues };
}

export function paperTitle(paper: TestPaper) {
  const exam = EXAMS[paper.exam];
  const subject = paper.subject ? ` ${SUBJECT_NAMES[paper.subject]}` : "";
  return paper.title ?? `${exam.shortName}${subject} — Test ${paper.testNumber}`;
}

// JSONB does not preserve key order, so compare with keys sorted.
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}

function sameQuestion(
  existing: { content: unknown; topics: string[]; subject: string; difficulty: string | null },
  options: { optionKey: string; content: unknown }[],
  key: { answer: unknown; explanation: unknown } | undefined,
  q: QuestionInput,
) {
  return (
    existing.subject === q.subject &&
    existing.difficulty === q.difficulty &&
    canonical(existing.topics) === canonical(q.topics) &&
    canonical(existing.content) === canonical(q.stem) &&
    canonical(options.map((o) => [o.optionKey, o.content])) ===
      canonical(q.options.map((o) => [o.id, o.content])) &&
    canonical(key?.answer) === canonical(q.answer) &&
    canonical(key?.explanation) === canonical(q.explanation)
  );
}

/** Reuses the latest revision when the question is unchanged; otherwise records a new approved revision. */
async function upsertQuestion(tx: Tx, q: QuestionInput, adminId: string) {
  let [bank] = await tx
    .select({ id: questionBankTable.id })
    .from(questionBankTable)
    .where(eq(questionBankTable.externalId, q.externalId));
  if (!bank)
    [bank] = await tx
      .insert(questionBankTable)
      .values({ externalId: q.externalId })
      .returning({ id: questionBankTable.id });

  const [latest] = await tx
    .select()
    .from(questionRevisionsTable)
    .where(eq(questionRevisionsTable.questionId, bank.id))
    .orderBy(desc(questionRevisionsTable.revision))
    .limit(1);

  if (latest && latest.status === "approved") {
    const options = await tx
      .select({ optionKey: questionOptionsTable.optionKey, content: questionOptionsTable.content })
      .from(questionOptionsTable)
      .where(eq(questionOptionsTable.revisionId, latest.id))
      .orderBy(questionOptionsTable.position);
    const [key] = await tx
      .select({ answer: answerKeysTable.answer, explanation: answerKeysTable.explanation })
      .from(answerKeysTable)
      .where(eq(answerKeysTable.revisionId, latest.id));
    if (sameQuestion(latest, options, key, q)) return { revisionId: latest.id, reused: true };
  }

  const [rev] = await tx
    .insert(questionRevisionsTable)
    .values({
      questionId: bank.id,
      revision: (latest?.revision ?? 0) + 1,
      type: q.type,
      subject: q.subject,
      topics: q.topics,
      difficulty: q.difficulty,
      content: q.stem,
      status: "approved",
      source: q.source,
      createdBy: adminId,
      reviewedBy: adminId,
    })
    .returning({ id: questionRevisionsTable.id });

  await tx.insert(questionOptionsTable).values(
    q.options.map((opt, position) => ({
      revisionId: rev.id,
      optionKey: opt.id,
      position,
      content: opt.content,
    })),
  );
  await tx.insert(answerKeysTable).values({
    revisionId: rev.id,
    answer: q.answer,
    explanation: q.explanation,
  });
  return { revisionId: rev.id, reused: false };
}

/**
 * Imports one paper as a new immutable test version (version 1 for a new test).
 * Earlier versions and the attempts made on them are left untouched.
 */
export async function importTestPaper(
  db: Db,
  paper: TestPaper,
  blueprint: ExamBlueprint,
  adminId: string,
  { publish }: { publish: boolean },
) {
  const title = paperTitle(paper);
  const subject = paper.subject ?? null;

  return db.transaction(async (tx) => {
    const [product] = await tx
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.slug, paper.exam));
    if (!product) throw new Error(`No product with slug "${paper.exam}" exists for this exam.`);

    const revisionIds = new Map<string, string>();
    let reusedQuestions = 0;
    for (const q of paper.questions) {
      const { revisionId, reused } = await upsertQuestion(tx, q, adminId);
      revisionIds.set(q.externalId, revisionId);
      if (reused) reusedQuestions++;
    }

    const catalogMatch = and(
      eq(testsTable.examSlug, paper.exam),
      subject ? eq(testsTable.subject, subject) : isNull(testsTable.subject),
      eq(testsTable.testNumber, paper.testNumber),
    );
    let [test] = await tx.select().from(testsTable).where(catalogMatch).for("update");
    if (!test) {
      [test] = await tx
        .insert(testsTable)
        .values({
          productId: product.id,
          title,
          durationMinutes: blueprint.durationMinutes,
          totalMarks: blueprint.totalMarks,
          published: false,
          examSlug: paper.exam,
          subject,
          testNumber: paper.testNumber,
          isFree: paper.free,
        })
        .returning();
    }

    // Question order the new version would have: blueprint section order, then paper order.
    const orderedRevisions = blueprint.sections.flatMap((s) =>
      paper.questions.filter((q) => q.subject === s.subject).map((q) => revisionIds.get(q.externalId)!),
    );

    const [latest] = await tx
      .select()
      .from(testVersionsTable)
      .where(eq(testVersionsTable.testId, test.id))
      .orderBy(desc(testVersionsTable.version))
      .limit(1);

    if (latest && (latest.publishedAt || !publish) && test.isFree === paper.free) {
      const current = await tx
        .select({ revisionId: testAssignmentsTable.revisionId })
        .from(testAssignmentsTable)
        .innerJoin(testSectionsTable, eq(testAssignmentsTable.sectionId, testSectionsTable.id))
        .where(eq(testAssignmentsTable.testVersionId, latest.id))
        .orderBy(testSectionsTable.position, testAssignmentsTable.position);
      if (JSON.stringify(current.map((c) => c.revisionId)) === JSON.stringify(orderedRevisions))
        return {
          testId: test.id,
          versionId: latest.id,
          version: latest.version,
          title,
          questions: paper.questions.length,
          reusedQuestions,
          published: Boolean(latest.publishedAt),
          unchanged: true,
        };
    }
    const now = new Date();

    const [version] = await tx
      .insert(testVersionsTable)
      .values({
        testId: test.id,
        version: (latest?.version ?? 0) + 1,
        title,
        durationSeconds: blueprint.durationMinutes * 60,
        rules: {
          blueprintId: blueprint.id,
          navigation: blueprint.navigation,
          allowBacktracking: blueprint.allowBacktracking,
          totalMarks: blueprint.totalMarks,
          scoringPolicy: blueprint.scoringPolicy,
        },
        publishedAt: publish ? now : null,
      })
      .returning();

    for (const [sectionIndex, sectionBlueprint] of blueprint.sections.entries()) {
      const [section] = await tx
        .insert(testSectionsTable)
        .values({
          testVersionId: version.id,
          subject: sectionBlueprint.subject,
          position: sectionIndex,
          rules: { name: sectionBlueprint.name },
        })
        .returning({ id: testSectionsTable.id });

      const questions = paper.questions.filter((q) => q.subject === sectionBlueprint.subject);
      await tx.insert(testAssignmentsTable).values(
        questions.map((q, position) => ({
          testVersionId: version.id,
          sectionId: section.id,
          revisionId: revisionIds.get(q.externalId)!,
          position,
          marks: sectionBlueprint.marksPerQuestion,
          penalty: sectionBlueprint.penaltyPerQuestion,
        })),
      );
    }

    await tx
      .update(testsTable)
      .set({
        title,
        isFree: paper.free,
        durationMinutes: blueprint.durationMinutes,
        totalMarks: blueprint.totalMarks,
        ...(publish ? { published: true } : {}),
      })
      .where(eq(testsTable.id, test.id));

    await tx.insert(auditLogTable).values({
      actorId: adminId,
      action: publish ? "test_paper.published" : "test_paper.imported",
      entityType: "test",
      entityId: test.id,
      details: {
        exam: paper.exam,
        subject,
        testNumber: paper.testNumber,
        version: version.version,
        questions: paper.questions.length,
        reusedQuestions,
      },
    });

    return {
      testId: test.id,
      versionId: version.id,
      version: version.version,
      title,
      questions: paper.questions.length,
      reusedQuestions,
      published: publish,
      unchanged: false,
    };
  }, { isolationLevel: "serializable" }).catch((error: unknown) => {
    // Two uploads of the same paper racing each other: the loser retries cleanly from the admin UI.
    if (error && typeof error === "object" && "code" in error && error.code === "40001")
      throw new Error("Another upload of this paper is in progress. Try again.");
    throw error;
  });
}
