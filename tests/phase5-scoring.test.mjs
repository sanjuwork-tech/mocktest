// Database-backed scoring check. Runs only when DATABASE_URL points at a migrated database.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { databaseConfigured, requireDb } from "../src/db/client.ts";
import {
  answerKeysTable,
  attemptAnswersTable,
  attemptResultsTable,
  attemptsTable,
  productsTable,
  questionBankTable,
  questionOptionsTable,
  questionRevisionsTable,
  testAssignmentsTable,
  testSectionsTable,
  testsTable,
  testVersionsTable,
  usersTable,
} from "../src/db/schema.ts";
import { processAttemptScoring } from "../src/server/scoring.ts";

const skip = databaseConfigured ? false : "Database not configured";
const run = randomUUID().slice(0, 8);
const para = [{ type: "paragraph", runs: [{ type: "text", text: "Q" }] }];
let attemptId;

test("setup: a two-section test scored best-of-1, +3/−1", { skip }, async () => {
  const db = requireDb();
  const [user] = await db
    .insert(usersTable)
    .values({ email: `phase5-${run}@example.com`, name: "Phase 5", role: "student" })
    .returning();
  const [staff] = await db
    .insert(usersTable)
    .values({ email: `phase5-staff-${run}@example.com`, name: "Phase 5 staff", role: "editor" })
    .returning();
  const [product] = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
  assert.ok(product, "seed products first (npm run db:seed)");

  // Not in the catalog (no exam_slug), so it never shows up for students.
  const [testRow] = await db
    .insert(testsTable)
    .values({ productId: product.id, title: `Phase 5 ${run}`, durationMinutes: 10, totalMarks: 6 })
    .returning();
  const [version] = await db
    .insert(testVersionsTable)
    .values({
      testId: testRow.id,
      version: 1,
      title: testRow.title,
      durationSeconds: 600,
      rules: { scoringPolicy: { bestSections: 1 } },
      publishedAt: new Date(),
    })
    .returning();

  const answers = [];
  for (const [position, subject] of ["physics", "chemistry"].entries()) {
    const [section] = await db
      .insert(testSectionsTable)
      .values({ testVersionId: version.id, subject, position })
      .returning();
    for (let i = 0; i < 2; i++) {
      const [bank] = await db.insert(questionBankTable).values({ externalId: `phase5-${run}-${subject}-${i}` }).returning();
      const [rev] = await db
        .insert(questionRevisionsTable)
        .values({
          questionId: bank.id,
          revision: 1,
          type: "single_choice",
          subject,
          topics: [subject],
          content: para,
          status: "approved",
          source: { kind: "original", reference: "test" },
          createdBy: staff.id,
        })
        .returning();
      await db.insert(questionOptionsTable).values(
        ["a", "b", "c", "d"].map((key, p) => ({ revisionId: rev.id, optionKey: key, position: p, content: para })),
      );
      await db.insert(answerKeysTable).values({ revisionId: rev.id, answer: { correctOptionId: "a" }, explanation: para });
      const [assignment] = await db
        .insert(testAssignmentsTable)
        .values({ testVersionId: version.id, sectionId: section.id, revisionId: rev.id, position: i, marks: 3, penalty: 1 })
        .returning();
      answers.push(assignment.id);
    }
  }

  const startedAt = new Date(Date.now() - 60_000);
  const [attempt] = await db
    .insert(attemptsTable)
    .values({
      userId: user.id,
      testVersionId: version.id,
      idempotencyKey: `phase5-${run}`,
      startedAt,
      deadline: new Date(startedAt.getTime() + 600_000),
      ordering: {},
    })
    .returning();
  attemptId = attempt.id;

  // Physics: both right (+6). Chemistry: one wrong, one blank (−1).
  const values = ["a", "a", "b", null];
  for (const [i, assignmentId] of answers.entries()) {
    if (values[i] === null) continue;
    await db.insert(attemptAnswersTable).values({ attemptId, assignmentId, testVersionId: version.id, value: values[i], sequence: 1 });
  }
});

test("an attempt in progress cannot be scored", { skip }, async () => {
  await assert.rejects(processAttemptScoring(attemptId), /Cannot score an in_progress attempt/);
});

test("scores the best section only and stores the result once", { skip }, async () => {
  const db = requireDb();
  await db.update(attemptsTable).set({ status: "submitted", submittedAt: new Date() }).where(eq(attemptsTable.id, attemptId));

  const result = await processAttemptScoring(attemptId);
  assert.equal(result.score, 6);
  assert.equal(result.maxScore, 6);
  assert.deepEqual(
    result.breakdown.sections.map((s) => [s.subject, s.score, s.counted]),
    [
      ["physics", 6, true],
      ["chemistry", -1, false],
    ],
  );

  const again = await processAttemptScoring(attemptId);
  assert.equal(again.createdAt.getTime(), result.createdAt.getTime());
  const rows = await db.select().from(attemptResultsTable).where(eq(attemptResultsTable.attemptId, attemptId));
  assert.equal(rows.length, 1);
});
