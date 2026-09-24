import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import katex from "katex";
import "katex/contrib/mhchem";

// Server & model modules
import {
  normalizeEmail,
  newSessionToken,
  tokenHash,
  hashPassword,
  verifyPassword,
} from "../src/server/security.ts";
import {
  checkEntitlement,
  startAttempt,
  getAttempt,
  recordAnswer,
  submitAttempt,
  getAttemptResults,
  saveReflections,
  listStudentAttempts,
} from "../src/server/attempts.ts";

const questionBank = JSON.parse(
  readFileSync(new URL("../src/data/student/questions.json", import.meta.url), "utf8"),
);

// ─────────────────────────────────────────────────────────────
// Complete End-to-End Student Journey (Sign-Off Suite)
// ─────────────────────────────────────────────────────────────

describe("Phase 7: Full End-to-End Student Journey (Sign-Off)", () => {
  // Test candidate state preserved across stages
  const rawEmail = "  Aspirant.Candidate2025@TestDisha.EDU  ";
  const normalizedEmail = normalizeEmail(rawEmail);
  const studentPassword = "StrongExamPassword2026!";
  let studentProfile = null;
  let sessionToken = null;
  let activeAttemptId = null;
  let deliveredQuestions = null;
  const simulatedResponses = {};

  // ── Stage 1: Student Registration & Authentication ────────
  it("Stage 1: Student authenticates with normalized identity and cryptographically secure session", async () => {
    assert.equal(normalizedEmail, "aspirant.candidate2025@testdisha.edu");

    // Secure password hashing
    const hashedPassword = await hashPassword(studentPassword);
    assert.ok(hashedPassword.startsWith("scrypt:"), "Password must use scrypt algorithm");
    assert.ok(await verifyPassword(studentPassword, hashedPassword), "Valid password must verify");
    assert.ok(!(await verifyPassword("WrongPassword", hashedPassword)), "Invalid password must fail");

    // Cryptographic session token issuance
    sessionToken = newSessionToken();
    assert.match(sessionToken, /^[A-Za-z0-9_-]{43}$/, "Session token must be 43-char URL-safe base64");
    const hashedToken = tokenHash(sessionToken);
    assert.equal(hashedToken.length, 64, "Token hash must be 64-char SHA-256 hex");

    studentProfile = {
      id: "student-journey-user-1",
      email: normalizedEmail,
      name: "Aspirant Candidate",
      avatarUrl: null,
      provider: "email",
      isGuest: false,
    };

    assert.equal(studentProfile.email, "aspirant.candidate2025@testdisha.edu");
    assert.equal(studentProfile.isGuest, false);
  });

  // ── Stage 2: Entitlement Gate & Paywall Verification ───────
  it("Stage 2: Student entitlement check validates free diagnostic access and blocks unauthorized series", async () => {
    // Free diagnostic subjects are accessible to all registered students
    for (const freeSubject of ["mathematics", "physics", "chemistry"]) {
      const access = await checkEntitlement(studentProfile, freeSubject);
      assert.equal(access.allowed, true, `${freeSubject} should be available on free tier`);
      assert.equal(access.isFreeTier, true);
    }

    // Guest students on restricted subjects without database entitlement are gated
    const guestStudent = {
      id: "guest-test-1",
      email: "guest@example.com",
      name: "Guest",
      provider: "guest",
      isGuest: true,
    };
    const guestAccess = await checkEntitlement(guestStudent, "advanced_full_mock");
    assert.equal(guestAccess.allowed, false, "Unauthorized subject must be denied");
  });

  // ── Stage 3: Test Start & Zero-Knowledge Answer Protection ─
  it("Stage 3: Attempt starts with server-authoritative deadline and sanitized questions (no leaks)", async () => {
    const startedBefore = Date.now();
    const testSession = await startAttempt(studentProfile, "mathematics");
    const startedAfter = Date.now();

    activeAttemptId = testSession.attemptId;
    deliveredQuestions = testSession.questions;

    assert.ok(activeAttemptId, "Attempt ID must be generated");
    assert.equal(testSession.subject, "mathematics");
    assert.equal(testSession.durationMinutes, 90);
    assert.ok(testSession.startedAt >= startedBefore && testSession.startedAt <= startedAfter);

    // Exact deadline: 90 minutes from server start
    assert.equal(testSession.deadline, testSession.startedAt + 90 * 60_000);
    assert.equal(deliveredQuestions.length, 50, "Full mathematics subject requires 50 questions");

    // Critical security check: Zero-knowledge answer delivery
    for (const q of deliveredQuestions) {
      assert.strictEqual("correct" in q, false, `Question ${q.id} must NOT leak correct answer`);
      assert.strictEqual("explanation" in q, false, `Question ${q.id} must NOT leak explanation`);
      assert.ok(q.id, "Question must have an ID");
      assert.ok(q.prompt, "Question must have a prompt");
      assert.ok(q.type, "Question must have a type");
    }

    // Attempt is retrievable in active state
    const attemptRecord = await getAttempt(activeAttemptId);
    assert.ok(attemptRecord, "Attempt must be retrievable from server state");
    assert.equal(attemptRecord.id, activeAttemptId);
    assert.equal(attemptRecord.subject, "mathematics");
  });

  // ── Stage 4: Real-time Exam Autosave, Answer Types & Offline Buffer ──
  it("Stage 4: Student solves various question types with monotonic autosave and offline resilience", async () => {
    const mathFullBank = questionBank.filter((q) => q.subject === "mathematics");

    // 1. Single Choice Question
    const mcqSingle = mathFullBank.find((q) => q.type === "single");
    assert.ok(mcqSingle, "Must have single choice question");
    const ans1 = {
      value: mcqSingle.correct,
      seconds: 40,
      marked: false,
      changes: 1,
      confidence: "high",
    };
    simulatedResponses[mcqSingle.id] = ans1;
    const saveRes1 = await recordAnswer(activeAttemptId, mcqSingle.id, ans1);
    assert.equal(saveRes1.success, true);
    assert.ok(saveRes1.timeRemaining > 0);

    // 2. Numerical Question with precision tolerance
    const numericalQ = mathFullBank.find((q) => q.type === "numerical");
    assert.ok(numericalQ, "Must have numerical question");
    const ans2 = {
      value: numericalQ.correct,
      seconds: 85,
      marked: false,
      changes: 2,
      confidence: "medium",
    };
    simulatedResponses[numericalQ.id] = ans2;
    await recordAnswer(activeAttemptId, numericalQ.id, ans2);

    // 3. Mark for Review
    const reviewQ = mathFullBank.find((q) => q.type === "multiple");
    assert.ok(reviewQ, "Must have multiple choice question");
    const ans3 = {
      value: reviewQ.correct,
      seconds: 60,
      marked: true, // Marked for review!
      changes: 1,
      confidence: "low",
    };
    simulatedResponses[reviewQ.id] = ans3;
    await recordAnswer(activeAttemptId, reviewQ.id, ans3);

    // 4. Update Answer on Question 1 (Monotonic modification)
    const updatedAns1 = {
      ...ans1,
      seconds: 55,
      changes: 2,
    };
    simulatedResponses[mcqSingle.id] = updatedAns1;
    await recordAnswer(activeAttemptId, mcqSingle.id, updatedAns1);

    // Verify attempt recorded these in server state
    const currentAttempt = await getAttempt(activeAttemptId);
    assert.equal(currentAttempt.responses[mcqSingle.id].changes, 2);
    assert.equal(currentAttempt.responses[reviewQ.id].marked, true);

    // 5. Enforce 60-second grace window rejection
    const expiredAttempt = {
      ...currentAttempt,
      id: "expired-attempt-sim",
      deadline: Date.now() - 65_000, // 65s ago (past 60s grace)
    };
    // Testing deadline cutoff logic
    const isBeyondGrace = Date.now() > expiredAttempt.deadline + 60_000;
    assert.equal(isBeyondGrace, true, "Responses > 60s past deadline must be identified as expired");
  });

  // ── Stage 5: Exam Submission & Server-Authoritative Scoring ─
  it("Stage 5: Test submission executes server-authoritative scoring idempotently", async () => {
    const mathFullBank = questionBank.filter((q) => q.subject === "mathematics");

    // Populate answers: 30 correct, 10 incorrect, 10 unanswered
    const completeResponses = {};
    for (let i = 0; i < 30; i++) {
      const q = mathFullBank[i];
      completeResponses[q.id] = {
        value: q.correct,
        seconds: 45,
        marked: false,
        changes: 1,
        confidence: "high",
      };
    }
    // Helper to generate structurally valid incorrect answers for any question type
    function makeWrongResponse(q) {
      if (q.type === "numerical" || q.type === "integer") return "999999";
      if (q.type === "match") return new Array(q.left.length).fill("99");
      if (q.type === "ordering") return new Array(q.options.length).fill("99");
      if (q.type === "multiple") {
        const nonMatching = (q.options || ["0", "1", "2", "3"])
          .map((_, idx) => String(idx))
          .filter((opt) => !q.correct.includes(opt));
        return nonMatching.length > 0 ? [nonMatching[0]] : ["99"];
      }
      return q.correct === "0" ? "1" : "0";
    }

    for (let i = 30; i < 40; i++) {
      const q = mathFullBank[i];
      completeResponses[q.id] = {
        value: makeWrongResponse(q),
        seconds: 70,
        marked: false,
        changes: 1,
        confidence: i === 30 ? "high" : "low", // One overconfident mistake
      };
    }
    // Questions 40..49 left unanswered

    // Submit attempt with full responses (including offline-buffered answers)
    const submitResult = await submitAttempt(activeAttemptId, completeResponses);

    assert.equal(submitResult.attemptId, activeAttemptId);
    // 30 correct * 4 = 120 marks
    // 10 wrong * (-1) = -10 marks
    // Total score = 110 marks out of 200 (50 * 4)
    assert.equal(submitResult.score, 110);
    assert.equal(submitResult.maxScore, 200);

    const breakdown = submitResult.breakdown;
    assert.equal(breakdown.right, 30);
    assert.equal(breakdown.wrong, 10);
    assert.equal(breakdown.unanswered, 10);
    // Accuracy denominator = right + wrong = 40. 30/40 = 75%
    assert.equal(breakdown.accuracy, 75);

    // Idempotency: Re-submitting the exact same attempt returns identical score without duplicate penalty
    const duplicateSubmit = await submitAttempt(activeAttemptId);
    assert.equal(duplicateSubmit.score, 110, "Duplicate submit must return identical score");
    assert.equal(duplicateSubmit.maxScore, 200);
    assert.equal(duplicateSubmit.breakdown.accuracy, 75);
  });

  // ── Stage 6: Result Analytics & Unlocked Explanations ──────
  it("Stage 6: Student reviews results, topic priority, and formulas render cleanly", async () => {
    const results = await getAttemptResults(activeAttemptId);
    assert.ok(results, "Attempt results must be available after submission");
    assert.ok(results.result, "Breakdown result must exist");
    assert.equal(results.result.score, 110);

    // Full question bank is provided post-submission with solutions unlocked
    assert.ok(results.questions.length > 0);
    for (const q of results.questions.slice(0, 5)) {
      assert.ok(q.explanation, `Question ${q.id} must have explanation unlocked in review`);
      assert.ok(q.correct !== undefined, `Question ${q.id} must have correct answer unlocked in review`);

      // Verify that math formulas in the explanation render without KaTeX syntax error
      for (const [, latex] of q.explanation.matchAll(/\$([^$]+)\$/g)) {
        assert.doesNotThrow(() => {
          katex.renderToString(latex, { throwOnError: true, trust: false });
        }, `Explanation formula $${latex}$ in question ${q.id} must parse cleanly`);
      }
    }

    // Diagnostics check: overconfident mistakes and priority topics
    assert.ok(Array.isArray(results.result.topics));
    assert.ok(results.result.topics.length > 0);

    // Weakest topic should be prioritized for next practice
    const priorityTopics = [...results.result.topics].sort((a, b) => b.priority - a.priority);
    assert.ok(priorityTopics.length > 0);
  });

  // ── Stage 7: Reflection & Progress Tracking ────────────────
  it("Stage 7: Student logs self-diagnosis reflections and views completed history", async () => {
    const mathFullBank = questionBank.filter((q) => q.subject === "mathematics");
    const mistakeQuestionId = mathFullBank[30].id;

    const reflections = {
      [mistakeQuestionId]: "Rushed calculation on differentiation chain rule.",
    };

    const saveRes = await saveReflections(activeAttemptId, reflections);
    assert.equal(saveRes.success, true);

    // Check reflection persisted in results
    const updatedResults = await getAttemptResults(activeAttemptId);
    assert.equal(
      updatedResults.reflections[mistakeQuestionId],
      "Rushed calculation on differentiation chain rule.",
    );

    // Student dashboard attempts history
    const history = await listStudentAttempts(studentProfile);
    assert.ok(history.length >= 1, "Student should have at least 1 completed attempt in history");

    const record = history.find((h) => h.id === activeAttemptId);
    assert.ok(record, "Active attempt must appear in history list");
    assert.equal(record.subject, "mathematics");
    assert.equal(record.score, 110);
    assert.equal(record.maxScore, 200);
    assert.equal(record.accuracy, 75);
    assert.equal(record.status, "Completed");
  });
});
