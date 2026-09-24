import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import "katex/contrib/mhchem";
import { QuestionBankBundleSchema } from "../src/lib/question-bank-schema.ts";

test("Phase 2: QuestionBankBundleSchema successfully validates example-question-bank.json", () => {
  const filePath = path.join(process.cwd(), "docs/question-format/example-question-bank.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(rawData);

  const result = QuestionBankBundleSchema.safeParse(parsed);
  assert.equal(result.success, true, `Validation failed: ${JSON.stringify(result.error?.issues)}`);

  const bundle = result.data;
  assert.equal(bundle.bundleType, "question_bank");
  assert.equal(bundle.questions.length, 4);

  // Validate that answer keys reference valid options
  for (const q of bundle.questions) {
    const optIds = new Set(q.options.map(o => o.id));
    assert.equal(optIds.has(q.answer.correctOptionId), true,
      `Question ${q.externalId}: correctOptionId "${q.answer.correctOptionId}" not found in options`);
  }
});

test("Phase 2: QuestionBankBundleSchema rejects invalid bundles", () => {
  // Empty questions array
  const emptyRes = QuestionBankBundleSchema.safeParse({
    schemaVersion: "1.0",
    bundleType: "question_bank",
    bundleId: "test-bundle",
    title: "Test",
    language: "en",
    questions: []
  });
  assert.equal(emptyRes.success, false, "Should reject empty questions array");

  // Missing required fields
  const missingRes = QuestionBankBundleSchema.safeParse({
    schemaVersion: "1.0",
    bundleType: "question_bank",
  });
  assert.equal(missingRes.success, false, "Should reject missing required fields");
});

test("Phase 2: All KaTeX and mhchem equations in example bundle render without errors", () => {
  const filePath = path.join(process.cwd(), "docs/question-format/example-question-bank.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const bundle = JSON.parse(rawData);

  function extractLatexRuns(blocks) {
    const runs = [];
    for (const b of blocks || []) {
      if (b.type === "paragraph" && b.runs) {
        for (const r of b.runs) {
          if (r.type === "math" && r.latex) runs.push(r.latex);
        }
      } else if (b.type === "display_math" && b.latex) {
        runs.push(b.latex);
      }
    }
    return runs;
  }

  let totalEquations = 0;
  for (const q of bundle.questions) {
    const stemLatex = extractLatexRuns(q.stem);
    const solLatex = extractLatexRuns(q.explanation);
    const optLatex = (q.options || []).flatMap(o => extractLatexRuns(o.content));

    const allLatex = [...stemLatex, ...solLatex, ...optLatex];
    for (const expr of allLatex) {
      totalEquations++;
      assert.doesNotThrow(() => {
        katex.renderToString(expr, {
          throwOnError: true,
          trust: false,
          strict: "warn",
          output: "htmlAndMathml",
        });
      }, `Failed to render LaTeX: ${expr}`);
    }
  }

  assert.ok(totalEquations > 0, "Should have rendered at least one equation");
});

test("Phase 2: XSS injection in LaTeX is neutralized by KaTeX trust:false", () => {
  // Attempt script injection via LaTeX
  const malicious = "\\text{<script>alert('xss')</script>}";
  const html = katex.renderToString(malicious, {
    throwOnError: false,
    trust: false,
    strict: "warn",
    output: "htmlAndMathml",
  });
  assert.equal(html.includes("<script>"), false, "Script tags must be neutralized");
});
