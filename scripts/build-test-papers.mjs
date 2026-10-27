// Converts the existing CUET question sources into test-paper JSON files that the
// admin "Upload test paper" screen and `npm run db:import-papers` accept.
//
//   node scripts/build-test-papers.mjs              → Test 1 (free) for 12 subjects, from the demo bank (no Chemistry source yet)
//   node scripts/build-test-papers.mjs --bank       → also Tests 2–25 for 12 subjects, from src/data/questions/cuet
//
// Output: data/test-papers/cuet-ug/<subject>/test-NN.json (data/ is not committed).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUT = path.join("data", "test-papers", "cuet-ug");
const SOURCE = {
  kind: "ai_assisted",
  reference: "OurMocks legacy CUET bank — needs academic review before launch",
};
const DIFFICULTY = {
  Foundation: "easy", Standard: "moderate", Stretch: "hard",
  easy: "easy", medium: "moderate", moderate: "moderate", hard: "hard",
};
const OPTION_IDS = ["a", "b", "c", "d"];

// Splits "text $x^2$ text" into text/math runs; the import format never guesses math from plain text.
export function toBlocks(text) {
  const runs = [];
  const parts = String(text ?? "").split(/(\$[^$]+\$)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const latex = part.slice(1, -1).trim();
      runs.push({ type: "math", latex, spokenText: latex });
    } else {
      runs.push({ type: "text", text: part });
    }
  }
  if (!runs.length) runs.push({ type: "text", text: "—" });
  return [{ type: "paragraph", runs }];
}

function question({ externalId, subject, topic, difficulty, prompt, options, correctIndex, explanation }) {
  if (options.length !== 4) throw new Error(`${externalId}: expected 4 options, got ${options.length}`);
  if (!(correctIndex >= 0 && correctIndex < 4)) throw new Error(`${externalId}: no valid correct option`);
  return {
    externalId,
    type: "single_choice",
    subject,
    topics: [topic || "General"],
    difficulty: DIFFICULTY[difficulty] ?? "moderate",
    stem: toBlocks(prompt),
    options: options.map((text, i) => ({ id: OPTION_IDS[i], content: toBlocks(text) })),
    answer: { correctOptionId: OPTION_IDS[correctIndex] },
    explanation: toBlocks(explanation || "Solution to be added."),
    source: SOURCE,
  };
}

function paper(subject, testNumber, questions) {
  return {
    schemaVersion: "1.0",
    bundleType: "test_paper",
    exam: "cuet-ug",
    subject,
    testNumber,
    free: testNumber === 1,
    language: "en",
    questions,
  };
}

function write(subject, testNumber, data) {
  const dir = path.join(OUT, subject);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `test-${String(testNumber).padStart(2, "0")}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

// Corrections for the two demo items that were not single-correct.
const DEMO_FIXES = {
  // "A square matrix A is symmetric if": only A = A' is correct (A = −A' is skew-symmetric).
  "mathematics-002": { correct: "1" },
  // Numerical item with options: the answer 2 is option D.
  "mathematics-003": { correct: "3" },
};

function demoPapers() {
  const bank = JSON.parse(fs.readFileSync("src/data/student/questions.json", "utf8"));
  const bySubject = new Map();
  for (const q of bank) {
    // The demo "chemistry" set is actually physics questions; real Chemistry papers must be uploaded.
    if (q.subject === "chemistry") continue;
    const subject = q.subject === "biological-science" ? "biology" : q.subject;
    const fix = DEMO_FIXES[q.id] ?? {};
    const list = bySubject.get(subject) ?? [];
    list.push(
      question({
        externalId: `cuet-${subject}-t01-q${String(list.length + 1).padStart(2, "0")}`,
        subject,
        topic: q.topic,
        difficulty: q.difficulty,
        prompt: q.prompt,
        options: q.options,
        correctIndex: Number(fix.correct ?? q.correct),
        explanation: q.explanation,
      }),
    );
    bySubject.set(subject, list);
  }
  return [...bySubject].map(([subject, questions]) => write(subject, 1, paper(subject, 1, questions)));
}

function bankPapers() {
  const root = path.join("src", "data", "questions", "cuet");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const files = [];
  for (const s of manifest.subjects) {
    const subject = s.id === "biological-science" ? "biology" : s.id;
    for (const p of s.papers) {
      if (p.paperNumber === 1) continue; // Test 1 comes from the corrected demo bank.
      const data = JSON.parse(fs.readFileSync(path.join(root, s.id, p.file), "utf8"));
      const tag = `t${String(p.paperNumber).padStart(2, "0")}`;
      const questions = data.questions.map((q, i) =>
        question({
          externalId: `cuet-${subject}-${tag}-q${String(i + 1).padStart(2, "0")}`,
          subject,
          topic: q.topic,
          difficulty: q.difficulty,
          prompt: q.question,
          options: (q.options ?? []).map((o) => o.replace(/^[A-D]\)\s*/, "")),
          correctIndex: "ABCD".indexOf(String(q.correct_option ?? "").trim().charAt(0).toUpperCase()),
          explanation: q.explanation,
        }),
      );
      files.push(write(subject, p.paperNumber, paper(subject, p.paperNumber, questions)));
    }
  }
  return files;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = demoPapers();
  if (process.argv.includes("--bank")) files.push(...bankPapers());
  console.log(`Wrote ${files.length} test papers to ${OUT}`);
}
