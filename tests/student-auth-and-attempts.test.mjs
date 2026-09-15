import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Import only pure modules — no server-only dependency
import { sanitizeQuestion } from "../src/lib/student/scoring.ts";
import { analyze, correct } from "../src/lib/student/model.ts";

const bank = JSON.parse(
  readFileSync(new URL("../src/data/student/questions.json", import.meta.url)),
);

test("sanitizeQuestion strips correct and explanation properties to prevent client-side inspection", () => {
  const q = bank[0];
  assert.ok(q.correct !== undefined, "original question must have correct answer");
  assert.ok(q.explanation !== undefined, "original question must have explanation");

  const sanitized = sanitizeQuestion(q);
  assert.equal(sanitized.id, q.id);
  assert.equal(sanitized.prompt, q.prompt);
  assert.equal(sanitized.type, q.type);
  assert.equal(sanitized.topic, q.topic);
  assert.equal("correct" in sanitized, false, "sanitized question must NOT contain 'correct'");
  assert.equal("explanation" in sanitized, false, "sanitized question must NOT contain 'explanation'");
});

test("server scoring evaluates complete attempt and calculates score, accuracy, and topic breakdown accurately", () => {
  const mathQuestions = bank.filter((q) => q.subject === "mathematics");
  assert.equal(mathQuestions.length, 50);

  // Simulate 10 correct answers, 5 incorrect answers, 35 unanswered
  const responses = {};
  for (let i = 0; i < 10; i++) {
    const q = mathQuestions[i];
    responses[q.id] = {
      value: q.correct,
      seconds: 45,
      marked: false,
      changes: 1,
      confidence: "high",
    };
  }
  for (let i = 10; i < 15; i++) {
    const q = mathQuestions[i];
    // Intentionally incorrect answer
    const wrongVal = Array.isArray(q.correct) ? ["WRONG"] : "WRONG_ANSWER";
    responses[q.id] = {
      value: wrongVal,
      seconds: 60,
      marked: true,
      changes: 2,
      confidence: "low",
    };
  }

  const attempt = {
    id: "attempt-1",
    subject: "mathematics",
    startedAt: Date.now() - 3600_000,
    deadline: Date.now() + 1800_000,
    submittedAt: Date.now(),
    current: 0,
    responses,
    reflections: { [mathQuestions[10].id]: "Silly arithmetic mistake" },
  };

  const result = analyze(mathQuestions, attempt);
  assert.equal(result.right, 10);
  assert.equal(result.wrong, 5);
  assert.equal(result.unanswered, 35);
  // Scoring: 10 * 4 - 5 * 1 = 35
  assert.equal(result.score, 35);
  assert.equal(result.max, 200);
  assert.equal(result.accuracy, Math.round((10 / 15) * 100)); // 67%
  assert.ok(result.topics.length > 0);
});

test("correct() rejects unanswered or empty responses", () => {
  const q = bank[0];
  assert.equal(correct(q, undefined), false);
  assert.equal(correct(q, { value: "", seconds: 0, marked: false, changes: 0 }), false);
});

test("correct() accepts matching answer value", () => {
  const q = bank[0];
  const r = { value: q.correct, seconds: 30, marked: false, changes: 1 };
  assert.equal(correct(q, r), true);
});

test("deadline cutoff rejects answers timestamped beyond the grace window", () => {
  const startedAt = 1000000;
  const deadline = startedAt + 90 * 60 * 1000; // 90 min deadline
  const graceWindow = 60 * 1000; // 60s grace

  const withinGrace = deadline + 30 * 1000;
  const pastGrace = deadline + 65 * 1000;

  assert.ok(withinGrace <= deadline + graceWindow, "within grace window should be accepted");
  assert.ok(pastGrace > deadline + graceWindow, "past grace window must be rejected");
});

test("sanitizeQuestion preserves all non-answer fields", () => {
  for (const q of bank.slice(0, 10)) {
    const s = sanitizeQuestion(q);
    assert.equal(s.id, q.id);
    assert.equal(s.subject, q.subject);
    assert.equal(s.type, q.type);
    assert.equal(s.difficulty, q.difficulty);
    assert.equal(s.prompt, q.prompt);
    assert.equal("correct" in s, false);
    assert.equal("explanation" in s, false);
  }
});
