import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import katex from "katex";
import "katex/contrib/mhchem";
import {
  correct,
  answered,
  analyze,
  TYPE_LABELS,
} from "../src/lib/student/model.ts";

const bank = JSON.parse(
  readFileSync(new URL("../src/data/student/questions.json", import.meta.url)),
);

const response = (value) => ({ value, seconds: 30, marked: false, changes: 1 });
const attempt = (responses = {}) => ({
  id: "test",
  subject: "mathematics",
  startedAt: 0,
  deadline: 5400000,
  submittedAt: 5000,
  current: 0,
  responses,
  reflections: {},
});

test("650 unique CUET questions: 50 per subject, verified options and valid answer keys", () => {
  assert.equal(bank.length, 650);
  assert.equal(new Set(bank.map((q) => q.id)).size, 650);
  for (const subject of [
    "mathematics",
    "physics",
    "chemistry",
    "biological-science",
    "accountancy",
    "computer-science",
    "economics",
    "english",
    "general-test",
    "geography",
    "history",
    "mass-media",
    "political-science",
  ]) {
    const qs = bank.filter((q) => q.subject === subject);
    assert.equal(qs.length, 50);
  }
  for (const q of bank) {
    assert.ok(q.explanation.length > 5, q.id);
    if (q.options) {
      assert.equal(new Set(q.options).size, q.options.length, q.id);
    }
    assert.ok(correct(q, response(q.correct)), q.id);
    assert.ok(!correct(q, response("")), q.id);
  }
});

test("every formula in prompt, explanation, and options renders with KaTeX/mhchem", () => {
  let total = 0;
  for (const q of bank) {
    for (const text of [
      q.prompt,
      q.passage ?? "",
      q.explanation,
      ...(q.options ?? []),
    ]) {
      for (const [, latex] of text.matchAll(/\$([^$]+)\$/g)) {
        assert.doesNotThrow(
          () =>
            katex.renderToString(latex, { throwOnError: true, trust: false }),
          `${q.id}: ${latex}`,
        );
        total++;
      }
    }
  }
  assert.ok(total > 20);
});

test("numerical grading accepts tolerance and scientific notation but rejects empty, nonfinite and invalid input", () => {
  const q = {
    id: "num-test",
    subject: "mathematics",
    type: "numerical",
    topic: "Integration",
    difficulty: "Foundation",
    prompt: "Evaluate integral",
    explanation: "Result is 1.5",
    tip: "Revise",
    targetSeconds: 75,
    correct: "1.5",
    tolerance: 0.001,
  };
  for (const value of ["1.5", "1.5009", "1.5e0"])
    assert.equal(correct(q, response(value)), true);
  for (const value of ["", " ", "NaN", "Infinity", "1.502", "1.5kg", "0x1"])
    assert.equal(correct(q, response(value)), false);
  const integer = { ...q, type: "integer", correct: "2", tolerance: 0 };
  assert.ok(correct(integer, response("2.0")));
  assert.ok(!correct(integer, response("2.1")));
});

test("multiple-choice is order-independent; matching and ordering are positional with no partial credit", () => {
  const multiple = {
    id: "multi-test",
    subject: "mathematics",
    type: "multiple",
    topic: "Roots",
    difficulty: "Foundation",
    prompt: "Select roots",
    explanation: "Roots are 0 and 2",
    tip: "Revise",
    targetSeconds: 75,
    options: ["2", "-2", "3", "-3"],
    correct: ["0", "2"],
  };
  assert.ok(correct(multiple, response([...multiple.correct].reverse())));
  assert.ok(!correct(multiple, response([multiple.correct[0]])));
  assert.ok(
    !correct(multiple, response([...multiple.correct, multiple.correct[0]])),
  );
  const match = {
    id: "match-test",
    subject: "mathematics",
    type: "match",
    topic: "Mapping",
    difficulty: "Foundation",
    prompt: "Match columns",
    explanation: "Correct map",
    tip: "Revise",
    targetSeconds: 75,
    left: ["A", "B"],
    right: ["1", "2"],
    correct: ["0", "1"],
  };
  assert.ok(!correct(match, response([...match.correct].reverse())));
  assert.ok(!answered(match, response(["0", ""])));
});

test("score totals, empty accuracy, topic priority and confidence signals follow actual responses", () => {
  const qs = bank.filter((q) => q.subject === "mathematics");
  let r = analyze(qs, attempt());
  assert.equal(r.score, 0);
  assert.equal(r.accuracy, null);
  assert.equal(r.unanswered, 50);
  assert.equal(r.topics[0].attempted, 0);
  const responses = Object.fromEntries(
    qs.map((q) => [q.id, response(q.correct)]),
  );
  r = analyze(qs, attempt(responses));
  assert.equal(r.score, 200);
  assert.equal(r.accuracy, 100);
  assert.equal(
    r.topics.reduce((n, t) => n + t.priority, 0),
    0,
  );
  responses[qs[0].id] = {
    ...response("wrong"),
    confidence: "high",
    seconds: 200,
  };
  delete responses[qs[1].id];
  r = analyze(qs, attempt(responses));
  assert.equal(r.score, 191);
  assert.equal(r.right, 48);
  assert.equal(r.wrong, 1);
  assert.equal(r.unanswered, 1);
  assert.equal(r.overconfident.length, 1);
  assert.equal(r.slowWrong.length, 1);
});
