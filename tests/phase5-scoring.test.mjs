import test from "node:test";
import assert from "node:assert/strict";
import { requireDb } from "../src/db/client.ts";
import {
  usersTable,
  testsTable,
  testSectionsTable,
  questionRevisionsTable,
  testAssignmentsTable,
  answerKeysTable,
  attemptsTable,
  attemptAnswersTable,
  attemptResultsTable,
} from "../src/db/schema.ts";
import { processAttemptScoring } from "../src/server/scoring.ts";
import { eq } from "drizzle-orm";

const MOCK_USER_ID = "test-phase5-user-" + Date.now();
const MOCK_TEST_ID = "test-phase5-test-" + Date.now();
const MOCK_ATTEMPT_ID = "test-phase5-attempt-" + Date.now();

test("setup phase 5 database data", async () => {
  const db = requireDb();

  await db.insert(usersTable).values({
    id: MOCK_USER_ID,
    email: "phase5@example.com",
    name: "Phase 5 User",
    role: "student",
    passwordHash: "dummy",
  });

  await db.insert(testsTable).values({
    id: MOCK_TEST_ID,
    title: "Scoring Integration Test",
    status: "published",
    type: "mock",
    blueprint: {},
  });

  const [section] = await db.insert(testSectionsTable).values({
    testVersionId: MOCK_TEST_ID,
    title: "Math Section",
    position: 1,
  }).returning();

  // Create a revision (Single Correct)
  const [rev1] = await db.insert(questionRevisionsTable).values({
    subject: "mathematics",
    type: "single",
    topics: ["Algebra"],
    content: {
      prompt: "What is 2+2?",
      options: ["3", "4", "5", "6"],
    },
    source: "tests",
  }).returning();

  await db.insert(answerKeysTable).values({
    revisionId: rev1.id,
    answer: "1", // option index for "4"
    explanation: "Basic arithmetic",
  });

  await db.insert(testAssignmentsTable).values({
    testVersionId: MOCK_TEST_ID,
    sectionId: section.id,
    revisionId: rev1.id,
    position: 1,
    marks: 4,
    penalty: 1,
  });

  // Create a revision (Numerical)
  const [rev2] = await db.insert(questionRevisionsTable).values({
    subject: "mathematics",
    type: "numerical",
    topics: ["Algebra"],
    content: {
      prompt: "What is 10/3?",
      tolerance: 0.01,
    },
    source: "tests",
  }).returning();

  await db.insert(answerKeysTable).values({
    revisionId: rev2.id,
    answer: "3.33",
    explanation: "Division",
  });

  const [assignment2] = await db.insert(testAssignmentsTable).values({
    testVersionId: MOCK_TEST_ID,
    sectionId: section.id,
    revisionId: rev2.id,
    position: 2,
    marks: 4,
    penalty: 1,
  }).returning();

  // Create the Attempt
  await db.insert(attemptsTable).values({
    id: MOCK_ATTEMPT_ID,
    userId: MOCK_USER_ID,
    testVersionId: MOCK_TEST_ID,
    status: "in_progress",
    deadline: new Date(Date.now() + 1000000),
  });

  // Provide answer for Numerical only (Assignment 2)
  await db.insert(attemptAnswersTable).values({
    attemptId: MOCK_ATTEMPT_ID,
    assignmentId: assignment2.id,
    value: "3.33",
    sequence: 1,
  });
});

test("processAttemptScoring throws if attempt is in_progress", async () => {
  await assert.rejects(
    () => processAttemptScoring(MOCK_ATTEMPT_ID),
    /Cannot score an in_progress attempt/
  );
});

test("processAttemptScoring calculates score correctly", async () => {
  const db = requireDb();
  
  await db.update(attemptsTable)
    .set({ status: "submitted" })
    .where(eq(attemptsTable.id, MOCK_ATTEMPT_ID));

  const result = await processAttemptScoring(MOCK_ATTEMPT_ID);
  
  assert.equal(result.maxScore, 8); // 4 + 4
  assert.equal(result.score, 4); // one correct (4), one unanswered (0)
  
  assert.ok(result.breakdown["Algebra"]);
  assert.equal(result.breakdown["Algebra"].total, 2);
  assert.equal(result.breakdown["Algebra"].attempted, 1);
  assert.equal(result.breakdown["Algebra"].correct, 1);
  assert.equal(result.breakdown["Algebra"].unanswered, 1);

  // Check idempotency
  const result2 = await processAttemptScoring(MOCK_ATTEMPT_ID);
  assert.equal(result.id, result2.id);
});
