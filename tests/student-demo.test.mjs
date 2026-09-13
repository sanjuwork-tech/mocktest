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
test("150 unique demo questions: 50 per subject, all ten formats, unambiguous options and valid references", () => {
  assert.equal(bank.length, 150);
  assert.equal(new Set(bank.map((q) => q.id)).size, 150);
  for (const subject of ["mathematics", "physics", "chemistry"]) {
    const qs = bank.filter((q) => q.subject === subject);
    assert.equal(qs.length, 50);
    for (const type of Object.keys(TYPE_LABELS))
      assert.equal(qs.filter((q) => q.type === type).length, 5);
  }
  for (const q of bank) {
    assert.ok(q.explanation.length > 25, q.id);
    if (q.options)
      assert.equal(new Set(q.options).size, q.options.length, q.id);
    if (q.right) assert.equal(new Set(q.right).size, q.right.length, q.id);
    assert.ok(correct(q, response(q.correct)), q.id);
    assert.ok(!correct(q, response("")), q.id);
  }
});
test("every formula in question, passage, option, matching label and solution renders with KaTeX/mhchem", () => {
  let total = 0;
  for (const q of bank) {
    for (const text of [
      q.prompt,
      q.passage ?? "",
      q.explanation,
      ...(q.options ?? []),
      ...(q.left ?? []),
      ...(q.right ?? []),
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
  assert.ok(total > 200);
});
test("numerical grading accepts tolerance and scientific notation but rejects empty, nonfinite and invalid input", () => {
  const q = {
    ...bank.find((q) => q.type === "numerical"),
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
  const multiple = bank.find((q) => q.type === "multiple");
  assert.ok(correct(multiple, response([...multiple.correct].reverse())));
  assert.ok(!correct(multiple, response([multiple.correct[0]])));
  assert.ok(
    !correct(multiple, response([...multiple.correct, multiple.correct[0]])),
  );
  for (const type of ["match", "ordering"]) {
    const q = bank.find((q) => q.type === type);
    assert.ok(!correct(q, response([...q.correct].reverse())));
    assert.ok(!answered(q, response(["0", ""])));
  }
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
  assert.equal(
    r.topics.reduce((n, t) => n + t.priority, 0),
    9,
  );
});
test("independently recomputed numerical and graph keys match all five parameter variants", () => {
  for (const subject of ["mathematics", "physics", "chemistry"]) {
    const qs = bank.filter((q) => q.subject === subject);
    for (let k = 0; k < 5; k++) {
      const a = k + 2;
      const numerical = qs[k * 10 + 2];
      assert.equal(
        Number(numerical.correct),
        subject === "chemistry" ? a / 4 : a / 2,
      );
      const graph = qs[k * 10 + 9];
      const first = graph.graph.points[0],
        last = graph.graph.points.at(-1);
      const slope = (last.y - first.y) / (last.x - first.x);
      assert.equal(
        Number(graph.options[Number(graph.correct)].split(" ")[0]),
        subject === "chemistry" ? -slope : slope,
      );
    }
  }
});
