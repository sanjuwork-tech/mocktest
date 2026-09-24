import test from "node:test";
import assert from "node:assert/strict";
import { examBlueprintSchema } from "../src/lib/blueprints/types.ts";
import {
  BLUEPRINT_PRESETS,
  IISER_IAT_2026_BLUEPRINT,
  NEST_2026_BLUEPRINT,
  COMEDK_2026_BLUEPRINT,
  CUET_UG_2026_BLUEPRINT,
} from "../src/lib/blueprints/definitions.ts";

test("Phase 3: All 4 Exam Blueprint presets strictly validate against examBlueprintSchema", () => {
  const presets = [
    IISER_IAT_2026_BLUEPRINT,
    NEST_2026_BLUEPRINT,
    COMEDK_2026_BLUEPRINT,
    CUET_UG_2026_BLUEPRINT,
  ];

  for (const bp of presets) {
    const parsed = examBlueprintSchema.safeParse(bp);
    assert.equal(
      parsed.success,
      true,
      `Blueprint ${bp.id} failed validation: ${JSON.stringify(parsed.error?.issues)}`
    );
  }
});

test("Phase 3: Blueprint sections strictly reconcile with duration, question count and total marks", () => {
  // 1. IISER IAT 2026: 4 sections of 15 questions = 60 Qs, 60 * 4 = 240 marks, 180 min
  const iat = IISER_IAT_2026_BLUEPRINT;
  assert.equal(iat.sections.length, 4);
  assert.equal(
    iat.sections.reduce((sum, s) => sum + s.questionCount, 0),
    iat.totalQuestions
  );
  assert.equal(
    iat.sections.reduce((sum, s) => sum + s.questionCount * s.marksPerQuestion, 0),
    iat.totalMarks
  );
  assert.equal(iat.durationMinutes, 180);
  assert.equal(iat.totalQuestions, 60);
  assert.equal(iat.totalMarks, 240);

  // 2. NEST 2026: 4 sections of 20 questions = 80 Qs, 80 * 3 = 240 marks, 180 min
  const nest = NEST_2026_BLUEPRINT;
  assert.equal(nest.sections.length, 4);
  assert.equal(
    nest.sections.reduce((sum, s) => sum + s.questionCount, 0),
    nest.totalQuestions
  );
  assert.equal(
    nest.sections.reduce((sum, s) => sum + s.questionCount * s.marksPerQuestion, 0),
    nest.totalMarks
  );
  assert.equal(nest.totalQuestions, 80);
  assert.equal(nest.totalMarks, 240);

  // 3. COMEDK 2026: 3 sections of 60 questions = 180 Qs, 180 * 1 = 180 marks, 180 min
  const comedk = COMEDK_2026_BLUEPRINT;
  assert.equal(comedk.sections.length, 3);
  assert.equal(
    comedk.sections.reduce((sum, s) => sum + s.questionCount, 0),
    comedk.totalQuestions
  );
  assert.equal(
    comedk.sections.reduce((sum, s) => sum + s.questionCount * s.marksPerQuestion, 0),
    comedk.totalMarks
  );
  assert.equal(comedk.totalQuestions, 180);
  assert.equal(comedk.totalMarks, 180);

  // 4. CUET UG 2026 Domain Math: 1 section of 50 questions = 50 Qs, 50 * 5 = 250 marks, 60 min
  const cuet = CUET_UG_2026_BLUEPRINT;
  assert.equal(cuet.sections.length, 1);
  assert.equal(
    cuet.sections.reduce((sum, s) => sum + s.questionCount, 0),
    cuet.totalQuestions
  );
  assert.equal(
    cuet.sections.reduce((sum, s) => sum + s.questionCount * s.marksPerQuestion, 0),
    cuet.totalMarks
  );
});

test("Phase 3: Publishing integrity verification blocks unapproved or incomplete tests", () => {
  // Simulation of integrity validator logic
  function validateTestForPublishing({
    sections,
    assignments,
    testTotalMarks,
  }) {
    const errors = [];

    // Check each section's required count
    for (const sec of sections) {
      const secAssignments = assignments.filter((a) => a.sectionId === sec.id);
      if (secAssignments.length !== sec.questionCount) {
        errors.push(
          `Section "${sec.name}" requires ${sec.questionCount} questions, but has ${secAssignments.length}.`
        );
      }
    }

    // Check that every question is approved
    const unapproved = assignments.filter((a) => a.status !== "approved");
    if (unapproved.length > 0) {
      for (const u of unapproved) {
        errors.push(`Question ${u.externalId} is not approved.`);
      }
    }

    // Check duplicate questions
    const seen = new Set();
    for (const a of assignments) {
      if (seen.has(a.questionId)) {
        errors.push(`Duplicate question: ${a.externalId}`);
      }
      seen.add(a.questionId);
    }

    // Total marks check
    const totalMarks = assignments.reduce((acc, curr) => acc + curr.marks, 0);
    if (totalMarks !== testTotalMarks) {
      errors.push(`Marks mismatch: ${totalMarks} vs required ${testTotalMarks}`);
    }

    return errors;
  }

  // Case 1: Incomplete section and unapproved question -> MUST FAIL
  const failResult = validateTestForPublishing({
    sections: [
      { id: "sec-bio", name: "Biology", questionCount: 2 },
      { id: "sec-chem", name: "Chemistry", questionCount: 2 },
    ],
    assignments: [
      { sectionId: "sec-bio", questionId: "q1", externalId: "Q1", status: "draft", marks: 4 },
      // missing second bio question
      { sectionId: "sec-chem", questionId: "q2", externalId: "Q2", status: "approved", marks: 4 },
      { sectionId: "sec-chem", questionId: "q2", externalId: "Q2", status: "approved", marks: 4 }, // duplicate!
    ],
    testTotalMarks: 16,
  });

  assert.equal(failResult.length > 0, true, "Should detect multiple errors");
  assert.equal(failResult.some((e) => e.includes("requires 2 questions")), true);
  assert.equal(failResult.some((e) => e.includes("not approved")), true);
  assert.equal(failResult.some((e) => e.includes("Duplicate question")), true);

  // Case 2: All sections complete, all approved, marks reconcile -> MUST PASS
  const passResult = validateTestForPublishing({
    sections: [
      { id: "sec-bio", name: "Biology", questionCount: 2 },
      { id: "sec-chem", name: "Chemistry", questionCount: 1 },
    ],
    assignments: [
      { sectionId: "sec-bio", questionId: "q1", externalId: "Q1", status: "approved", marks: 4 },
      { sectionId: "sec-bio", questionId: "q2", externalId: "Q2", status: "approved", marks: 4 },
      { sectionId: "sec-chem", questionId: "q3", externalId: "Q3", status: "approved", marks: 4 },
    ],
    testTotalMarks: 12,
  });

  assert.equal(passResult.length, 0, "Valid test must have 0 errors");
});
