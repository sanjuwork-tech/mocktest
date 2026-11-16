import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyseAttempt, analyseOverall } from "../src/lib/analysis.ts";

// A 10-question, 600-second paper: the ideal pace is 60 s per question.
const base = {
  sectionId: "s",
  sectionName: "Physics",
  topics: ["Optics"],
  difficulty: "moderate",
  marks: 5,
  penalty: 1,
  correctOptionId: "a",
  firstValue: null,
  changes: 0,
  visits: 1,
  marked: false,
};
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
    assert.deepEqual(
      { total: r.changes.total, wrongToRight: r.changes.wrongToRight, rightToWrong: r.changes.rightToWrong, wrongToWrong: r.changes.wrongToWrong },
      { total: 2, wrongToRight: 1, rightToWrong: 1, wrongToWrong: 0 },
    );
    // Q8: first +5, final −1 (−6). Q9: first −1, final +5 (+6). Net zero.
    assert.deepEqual([r.changes.gained, r.changes.lost, r.changes.net], [6, 6, 0]);
    assert.equal(r.questions[7].changeKind, "right-to-wrong");
    assert.equal(r.questions[8].changeKind, "wrong-to-right");
    assert.equal(r.recoverable.changedAwayFromRight, 6); // lost the 5 marks and took a −1
    assert.equal(r.recoverable.rushedPenalty, 1);
  });

  it("finds time sinks and the costliest topic", () => {
    assert.deepEqual(
      r.timeSinks.map((t) => t.number),
      [4, 5],
    );
    assert.equal(r.topics[0].name, "Optics");
    assert.ok(r.insights.length > 0);
    assert.equal(r.review.marked, 1);
    assert.equal(r.review.markedCorrect, 1);
    assert.equal(r.review.markedUnanswered, 0);
    assert.ok(r.insights.every((i) => i.tab && i.tone));
  });

  it("flags blanks when there is no negative marking", () => {
    const noPenalty = analyseAttempt([q(1, { penalty: 0, marks: 1 }), q(2, { penalty: 0, marks: 1, value: "a" })], 120);
    assert.ok(noPenalty.insights.some((i) => /no negative marking/.test(i.title)));
  });
});

describe("score story, pacing and decisions", () => {
  const questions = [
    q(1, { value: "a", timeMs: 30_000 }),
    q(2, { value: "a", timeMs: 90_000 }),
    q(3, { value: "b", timeMs: 8_000 }),
    q(4, { value: "b", timeMs: 120_000, topics: ["Magnetism"] }),
    q(5, { timeMs: 100_000 }),
    q(6, { timeMs: 10_000 }),
    q(7, { visits: 0 }),
    q(8, { value: "c", firstValue: "a", changes: 1, timeMs: 50_000 }),
    q(9, { value: "a", firstValue: "d", changes: 1, timeMs: 50_000, marked: true }),
    q(10, { value: "a", timeMs: 20_000, difficulty: "hard" }),
  ];
  const r = analyseAttempt(questions, 600);

  it("walks from the maximum down to the score", () => {
    const s = r.score;
    assert.equal(s.max, 50);
    assert.equal(s.score, 5 * 4 - 3); // 4 right, 3 wrong
    assert.equal(s.max - s.blankMarks - s.wrongMarks - s.penalty, s.score);
    assert.deepEqual([s.attempted, s.correct, s.wrong, s.blank, s.notReached], [7, 4, 3, 2, 1]);
    assert.equal(s.attemptRate, 70);
    assert.equal(s.accuracy, 57);
  });

  it("tracks cumulative time against the ideal pace", () => {
    assert.equal(r.pace.points[1].cumMs, 120_000);
    assert.equal(r.pace.points[1].idealMs, 120_000);
    // After Q5 the student had used 348 s against an ideal 300 s.
    assert.deepEqual(r.pace.maxBehind, { index: 4, ms: 48_000 });
    assert.equal(r.time.medianMs, 50_000); // 9 timed questions: the 5th fastest
    assert.equal(r.time.slowest.count, 1);
    assert.deepEqual(r.time.slowest.indexes, [3]);
  });

  it("splits answers into speed × accuracy quadrants and finds guesses", () => {
    assert.deepEqual(r.quadrants, { fastRight: 3, slowRight: 1, fastWrong: 2, slowWrong: 1 });
    // Under 24 s: Q3 wrong (−1) and Q10 right (+5).
    assert.deepEqual([r.guesses.count, r.guesses.correct, r.guesses.wrong, r.guesses.net], [2, 1, 1, 4]);
  });

  it("groups topics by chapter, the first topic of each question", () => {
    const t = analyseAttempt([q(1, { topics: ["Optics", "Lens formula"], value: "b" }), q(2, { topics: ["Optics", "Prism"], value: "a" })], 120);
    assert.deepEqual(
      t.topics.map((x) => [x.name, x.total, x.marksLost]),
      [["Optics", 2, 6]],
    );
  });

  it("reports time as not recorded for old attempts", () => {
    const old = analyseAttempt([q(1, { value: "a", visits: 1 }), q(2, { value: "b", visits: 1 })], 120);
    assert.equal(old.time.recorded, false);
    assert.equal(old.pace.maxBehind, null);
    assert.equal(old.guesses.count, 0);
  });

  it("applies NEST best-of-N to pace and the maximum", () => {
    const sec = (id, n, value) => Array.from({ length: n }, (_, i) => q(i + 1, { sectionId: id, sectionName: id, value, timeMs: 10_000 }));
    const paper = [...sec("A", 2, "a"), ...sec("B", 2, "a"), ...sec("C", 2, "b"), ...sec("D", 2, null)];
    const n = analyseAttempt(paper, 600, { bestSections: 3 });
    assert.equal(n.time.targetMs, 100_000); // 600 s over the 6 questions in 3 sections
    assert.equal(n.score.max, 30);
    assert.deepEqual(n.score.notCounted, ["C"]);
    assert.equal(n.score.score, 20);
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
    assert.deepEqual(
      o.trend.map((t) => t.accuracy),
      [50, 100],
    );
    assert.equal(o.topicGrid.rows[0].cells.length, 2);
  });

  it("flags topics that lost marks in every test", () => {
    const weak = () => analyseAttempt([q(1, { value: "b", timeMs: 40_000 }), q(2, { value: "a", timeMs: 40_000, topics: ["Waves"] })], 120);
    const o = analyseOverall([
      { attemptId: "1", title: "T1", exam: "cuet-ug", subject: "physics", date: "2026-10-01", score: 4, maxScore: 10, analysis: weak() },
      { attemptId: "2", title: "T2", exam: "cuet-ug", subject: "physics", date: "2026-10-08", score: 4, maxScore: 10, analysis: weak() },
    ]);
    assert.deepEqual(
      o.persistent.map((t) => t.name),
      ["Optics"],
    );
    assert.match(o.plan[0], /Optics/);
  });
});
