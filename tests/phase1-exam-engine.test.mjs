import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreAttempt } from "../src/server/scoring.ts";
import { checkPaper, paperTitle } from "../src/server/test-papers.ts";
import { testPaperSchema } from "../src/lib/question-bank-schema.ts";
import {
  blueprintFor,
  COMEDK_2026_BLUEPRINT,
  IISER_IAT_2026_BLUEPRINT,
  NEST_2026_BLUEPRINT,
} from "../src/lib/blueprints/definitions.ts";
import { EXAMS, SUBJECT_IDS } from "../src/lib/exams/catalog.ts";
import { hashPassword, safeEqual } from "../src/server/security.ts";
import { toBlocks } from "../scripts/build-test-papers.mjs";

const para = (text) => [{ type: "paragraph", runs: [{ type: "text", text }] }];

function question(id, subject, correct = "a") {
  return {
    externalId: id,
    type: "single_choice",
    subject,
    topics: ["Topic"],
    difficulty: "moderate",
    stem: para(`Question ${id}`),
    options: ["a", "b", "c", "d"].map((o) => ({ id: o, content: para(o) })),
    answer: { correctOptionId: correct },
    explanation: para("Because."),
    source: { kind: "original", reference: "test" },
  };
}

function paper(overrides = {}, questions) {
  return testPaperSchema.parse({
    schemaVersion: "1.0",
    bundleType: "test_paper",
    exam: "cuet-ug",
    subject: "physics",
    testNumber: 2,
    language: "en",
    questions: questions ?? Array.from({ length: 50 }, (_, i) => question(`p-q${i + 1}`, "physics")),
    ...overrides,
  });
}

/** Builds scoring input: one section per entry, `n` questions each, marks/penalty as given. */
function sections(spec) {
  const out = { sections: [], assignments: [], answers: new Map() };
  spec.forEach(({ n, marks, penalty, answers }, s) => {
    out.sections.push({ id: `s${s}`, subject: `subject-${s}`, position: s });
    for (let i = 0; i < n; i++) {
      const id = `s${s}-q${i}`;
      out.assignments.push({ id, sectionId: `s${s}`, marks, penalty, topics: [`t${s}`], correctOptionId: "a" });
      if (answers[i] !== undefined) out.answers.set(id, answers[i]);
    }
  });
  return out;
}

describe("Phase 1: official scoring", () => {
  it("CUET: +5 correct, −1 wrong, 0 unanswered or cleared", () => {
    const input = sections([{ n: 50, marks: 5, penalty: 1, answers: ["a", "a", "b", null, ""] }]);
    const { score, maxScore, breakdown } = scoreAttempt(input);
    assert.equal(score, 2 * 5 - 1);
    assert.equal(maxScore, 250);
    assert.deepEqual(
      { correct: breakdown.sections[0].correct, wrong: breakdown.sections[0].wrong, unanswered: breakdown.sections[0].unanswered },
      { correct: 2, wrong: 1, unanswered: 47 },
    );
  });

  it("COMEDK has no negative marking", () => {
    const input = sections(COMEDK_2026_BLUEPRINT.sections.map((s) => ({ n: s.questionCount, marks: 1, penalty: 0, answers: ["b", "b", "a"] })));
    const { score, maxScore } = scoreAttempt(input);
    assert.equal(score, 3);
    assert.equal(maxScore, 180);
  });

  it("NEST counts only the best three sections", () => {
    const answers = [
      Array(20).fill("a"), // 60
      Array(10).fill("a"), // 30
      ["a", "b", "b", "b", "b"], // 3 − 4 = −1
      Array(15).fill("a"), // 45
    ];
    const input = sections(answers.map((a) => ({ n: 20, marks: 3, penalty: 1, answers: a })));
    const { score, maxScore, breakdown } = scoreAttempt({ ...input, bestSections: 3 });
    assert.equal(score, 60 + 45 + 30);
    assert.equal(maxScore, 180);
    assert.deepEqual(breakdown.sections.map((s) => s.counted), [true, true, false, true]);
  });

  it("topic tallies add up to the question count", () => {
    const { breakdown } = scoreAttempt(sections([{ n: 10, marks: 4, penalty: 1, answers: ["a", "b"] }]));
    const t = breakdown.topics.t0;
    assert.equal(t.correct + t.wrong + t.unanswered, t.total);
    assert.equal(t.total, 10);
  });
});

describe("Phase 1: test paper validation", () => {
  it("accepts a CUET paper that matches the official pattern", () => {
    const { blueprint, issues } = checkPaper(paper());
    assert.deepEqual(issues, []);
    assert.equal(blueprint.totalMarks, 250);
    assert.equal(paperTitle(paper()), "CUET Physics — Test 2");
  });

  it("rejects a paper with the wrong number of questions", () => {
    const short = paper({}, Array.from({ length: 49 }, (_, i) => question(`q${i}`, "physics")));
    const { blueprint, issues } = checkPaper(short);
    assert.equal(blueprint, undefined);
    assert.match(issues[0].message, /needs 50 questions; the paper has 49/);
  });

  it("rejects a CUET paper without a subject and an IAT paper with one", () => {
    assert.ok(checkPaper(paper({ subject: undefined })).issues.some((i) => i.path === "subject"));
    assert.ok(checkPaper(paper({ exam: "iiser-iat" })).issues.some((i) => i.path === "subject"));
  });

  it("rejects duplicate IDs, unknown answers and off-pattern subjects", () => {
    const qs = Array.from({ length: 50 }, (_, i) => question(`q${i}`, "physics"));
    qs[1] = question("q0", "physics");
    qs[2] = question("q2", "physics", "z");
    qs[3] = question("q3", "chemistry");
    const messages = checkPaper(paper({}, qs)).issues.map((i) => i.message).join(" | ");
    assert.match(messages, /Duplicate question ID/);
    assert.match(messages, /Correct option "z"/);
    assert.match(messages, /"chemistry" is not a section/);
  });

  it("validates a full IAT paper section by section", () => {
    const qs = IISER_IAT_2026_BLUEPRINT.sections.flatMap((s) =>
      Array.from({ length: s.questionCount }, (_, i) => question(`${s.subject}-${i}`, s.subject)),
    );
    const { blueprint, issues } = checkPaper(paper({ exam: "iiser-iat", subject: undefined, testNumber: 35 }, qs));
    assert.deepEqual(issues, []);
    assert.equal(blueprint.id, "iiser-iat-2026");
  });

  it("rejects test numbers beyond the planned series", () => {
    assert.ok(checkPaper(paper({ testNumber: 26 })).issues.some((i) => i.path === "testNumber"));
  });
});

describe("Phase 1: catalog and blueprints", () => {
  it("every CUET subject has a 50-question, 60-minute, +5/−1 paper", () => {
    for (const subject of EXAMS["cuet-ug"].subjects) {
      const b = blueprintFor("cuet-ug", subject);
      assert.equal(b.totalQuestions, 50, subject);
      assert.equal(b.durationMinutes, 60, subject);
      assert.equal(b.sections[0].marksPerQuestion, 5, subject);
      assert.equal(b.sections[0].penaltyPerQuestion, 1, subject);
    }
    assert.equal(blueprintFor("cuet-ug", null), undefined);
  });

  it("plans 25 tests per CUET subject and 35 for each other exam", () => {
    assert.equal(EXAMS["cuet-ug"].plannedTests, 25);
    for (const exam of ["iiser-iat", "niser-nest", "comedk"]) assert.equal(EXAMS[exam].plannedTests, 35);
    assert.equal(SUBJECT_IDS.length, 13);
  });

  it("NEST is three hours, as in the official brochure", () => {
    assert.equal(NEST_2026_BLUEPRINT.durationMinutes, 180);
  });
});

describe("Phase 1: conversion and security helpers", () => {
  it("splits $…$ math into explicit math runs", () => {
    const [block] = toBlocks("Area is $\\pi r^2$ units");
    assert.deepEqual(block.runs.map((r) => r.type), ["text", "math", "text"]);
    assert.equal(block.runs[1].latex, "\\pi r^2");
  });

  it("students may use 8-character passwords; staff still need 12", async () => {
    await assert.doesNotReject(hashPassword("abcdefgh", 8));
    await assert.rejects(hashPassword("abcdefgh"), /between 12 and 128/);
  });

  it("safeEqual compares without throwing on different lengths", () => {
    assert.equal(safeEqual("secret", "secret"), true);
    assert.equal(safeEqual("secret", "secret!"), false);
  });
});
