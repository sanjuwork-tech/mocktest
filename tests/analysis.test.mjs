import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyseAttempt, analyseOverall } from "../src/lib/analysis.ts";

// A 10-question, 600-second paper: the ideal pace is 60 s per question.
const base = { sectionId: "s", sectionName: "Physics", topics: ["Optics"], difficulty: "moderate", marks: 5, penalty: 1, correctOptionId: "a", firstValue: null, changes: 0, visits: 1, marked: false };
const q = (n, over) => ({ ...base, number: n, value: null, timeMs: 0, ...over });

describe("attempt analysis", () => {
  const questions = [
    q(1, { value: "a", timeMs: 30_000 }), // fast-correct
    q(2, { value: "a", timeMs: 90_000 }), // slow-correct
    q(3, { value: "b", timeMs: 8_000 }), // rushed-wrong
    q(4, { value: "b", timeMs: 120_000, topics: ["Magnetism"] }), // struggled-wrong + time sink
    q(5, { timeMs: 100_000 }), // time-sink-skip
    q(6, { timeMs: 10_000 }), // skipped
    q(7, { visits: 0 }), // not reached
    q(8, { value: "c", firstValue: "a", changes: 1, timeMs: 50_000 }), // right -> wrong
    q(9, { value: "a", firstValue: "d", changes: 1, timeMs: 50_000, marked: true }), // wrong -> right
    q(10, { value: "a", timeMs: 20_000, difficulty: "hard" }),
  ];
  const r = analyseAttempt(questions, 600);

  it("classifies each answer by outcome and time against the ideal pace", () => {
    assert.equal(r.time.targetMs, 60_000);
    assert.equal(r.qualities["fast-correct"], 3);
    assert.equal(r.qualities["slow-correct"], 1);
    assert.equal(r.qualities["rushed-wrong"], 1);
    assert.equal(r.qualities["struggled-wrong"], 2);
    assert.equal(r.qualities["time-sink-skip"], 1);
    assert.equal(r.qualities.skipped, 1);
    assert.equal(r.qualities["not-reached"], 1);
  });

  it("tracks whether answer changes helped", () => {
    assert.deepEqual(r.changes, { total: 2, wrongToRight: 1, rightToWrong: 1, wrongToWrong: 0 });
    assert.equal(r.recoverable.changedAwayFromRight, 6); // lost the 5 marks and took a −1
    assert.equal(r.recoverable.rushedPenalty, 1);
  });

  it("finds time sinks and the costliest topic", () => {
    assert.deepEqual(r.timeSinks.map((t) => t.number), [4, 5]);
    assert.equal(r.topics[0].name, "Optics");
    assert.ok(r.insights.length > 0);
    assert.deepEqual(r.review, { marked: 1, markedCorrect: 1, markedUnanswered: 0 });
  });

  it("flags blanks when there is no negative marking", () => {
    const noPenalty = analyseAttempt([q(1, { penalty: 0, marks: 1 }), q(2, { penalty: 0, marks: 1, value: "a" })], 120);
    assert.ok(noPenalty.insights.some((i) => /no negative marking/.test(i.title)));
  });
});

describe("overall analysis", () => {
  it("builds a trend and focus topics across attempts", () => {
    const one = analyseAttempt([q(1, { value: "b", timeMs: 5_000 }), q(2, { value: "a", timeMs: 40_000 })], 120);
    const two = analyseAttempt([q(1, { value: "a", timeMs: 30_000 }), q(2, { value: "a", timeMs: 40_000 })], 120);
    const o = analyseOverall([
      { attemptId: "1", title: "T1", exam: "cuet-ug", subject: "physics", date: "2026-10-01", score: 4, maxScore: 10, analysis: one },
      { attemptId: "2", title: "T2", exam: "cuet-ug", subject: "physics", date: "2026-10-08", score: 10, maxScore: 10, analysis: two },
    ]);
    assert.equal(o.attempts, 2);
    assert.equal(o.change, 60);
    assert.equal(o.focus[0].name, "Optics");
    assert.equal(o.subjects[0].bestPercent, 100);
  });
});
