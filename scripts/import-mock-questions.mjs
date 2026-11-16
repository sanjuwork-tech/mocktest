// Converts the OurMocks question repository (Avenger2007/Mock-Questions) into test-paper JSON files
// for `npm run db:import-papers`. The repository is read as data only; none of its scripts are run.
//
//   node scripts/import-mock-questions.mjs <path-to-cloned-repo>
//
// Output: data/test-papers/cuet-ug/<subject>/test-NN.json, data/test-papers/iiser-iat/test-NN.json,
// and IAT images copied to data/assets/<assetId>.png (data/ is not committed).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { testPaperSchema } from "../src/lib/question-bank-schema.ts";
import { checkPaper } from "../src/server/test-papers.ts";

const OUT = path.join("data", "test-papers");
const ASSETS = path.join("data", "assets");
const OPTION_IDS = ["a", "b", "c", "d"];
const DIFFICULTY = { easy: "easy", medium: "moderate", moderate: "moderate", hard: "hard" };
const CUET_FOLDERS = {
  "Biological Science": "biology",
  Chemistry: "chemistry",
  Economics: "economics",
  English: "english",
  "General Test": "general-test",
  Geography: "geography",
  History: "history",
  "Mass Media": "mass-media",
  Physics: "physics",
  "Political Science": "political-science",
};
const IAT_SECTIONS = { B: "biology", C: "chemistry", M: "mathematics", P: "physics" };

/** Splits text into text / inline-math (\( … \)) / display-math (\[ … \]) tokens. A bare "$" is plain text. */
export function tokenize(input) {
  const text = String(input ?? "");
  const tokens = [];
  const re = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) tokens.push({ kind: "text", value: text.slice(last, m.index) });
    const inline = m[1] !== undefined;
    const latex = (inline ? m[1] : m[2]).replace(/\s+/g, " ").trim();
    if (latex) tokens.push({ kind: inline ? "inline" : "display", value: latex });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: "text", value: text.slice(last) });
  return tokens;
}

const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_RULE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
const cellRuns = (text) => {
  const runs = tokenize(text).map((t) => (t.kind === "text" ? { type: "text", text: t.value } : { type: "math", latex: t.value, spokenText: t.value }));
  return runs.length ? runs : [{ type: "text", text: "—" }];
};

/** Converts source text to schema blocks; Markdown pipe tables become table blocks, the rest goes through textBlocks. */
export function toBlocks(input) {
  const lines = String(input ?? "").split(/\r?\n/);
  const blocks = [];
  let text = [];
  for (let i = 0; i < lines.length; i++) {
    if (!(TABLE_ROW.test(lines[i]) && TABLE_RULE.test(lines[i + 1] ?? ""))) {
      text.push(lines[i]);
      continue;
    }
    // A short title line right above the table becomes its caption.
    while (text.length && !text[text.length - 1].trim()) text.pop();
    const title = text[text.length - 1]?.trim() ?? "";
    const caption = title && !/[.:?]$/.test(title) ? (text.pop(), title) : "Table";
    if (text.join("").trim()) blocks.push(...textBlocks(text.join("\n")));
    text = [];
    const headers = cells(lines[i]).map(cellRuns);
    const rows = [];
    for (i += 2; i < lines.length && TABLE_ROW.test(lines[i]); i++) rows.push(cells(lines[i]).map(cellRuns));
    i--;
    blocks.push({ type: "table", caption, headers, rows });
  }
  if (text.join("").trim() || !blocks.length) blocks.push(...textBlocks(text.join("\n")));
  return blocks;
}

/** Converts plain source text to schema blocks: newlines become paragraphs, \[ \] becomes display_math. */
function textBlocks(input) {
  const blocks = [];
  let runs = [];
  const flush = () => {
    const first = runs[0];
    if (first?.type === "text") first.text = first.text.replace(/^\s+/, "");
    const lastRun = runs[runs.length - 1];
    if (lastRun?.type === "text") lastRun.text = lastRun.text.replace(/\s+$/, "");
    const clean = runs.filter((r) => r.type === "math" || r.text.length > 0);
    if (clean.length) blocks.push({ type: "paragraph", runs: clean });
    runs = [];
  };
  for (const t of tokenize(input)) {
    if (t.kind === "text") {
      t.value.split(/\r?\n/).forEach((line, i) => {
        if (i > 0) flush();
        if (line) runs.push({ type: "text", text: line });
      });
    } else if (t.kind === "inline") {
      runs.push({ type: "math", latex: t.value, spokenText: t.value });
    } else {
      flush();
      blocks.push({ type: "display_math", latex: t.value, spokenText: t.value });
    }
  }
  flush();
  if (!blocks.length) blocks.push({ type: "paragraph", runs: [{ type: "text", text: "—" }] });
  return blocks;
}

export function stripOption(option) {
  return String(option ?? "").replace(/^\s*[A-D]\)\s*/, "");
}

export function assetIdFor(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 24);
}

export function externalIdFor(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

function convertQuestion(q, subject, sourceFile, ctx) {
  const externalId = externalIdFor(q.id);
  if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(`${externalId}: expected 4 options`);
  const correct = OPTION_IDS["ABCD".indexOf(String(q.correct_option ?? "").trim().toUpperCase())];
  if (!correct) throw new Error(`${externalId}: invalid correct_option`);
  const difficulty = DIFFICULTY[q.difficulty];
  if (!difficulty) throw new Error(`${externalId}: unknown difficulty ${q.difficulty}`);

  const all = [q.question, ...q.options, q.explanation].join("\n");
  if (all.includes("$")) {
    for (const m of all.matchAll(/\$[^$]*\$/g))
      if (/[\\^_{}]/.test(m[0])) ctx.dollarMaths.push(`${externalId}: ${m[0].slice(0, 60)}`);
  }
  if ((all.match(/\\\(/g) || []).length !== (all.match(/\\\)/g) || []).length)
    ctx.unbalanced.push(externalId);

  const stem = toBlocks(q.question);
  if (q.image_reference) {
    const file = path.join(ctx.imageDir, q.image_reference);
    if (!ctx.imageDir || !fs.existsSync(file)) throw new Error(`${externalId}: missing image ${q.image_reference}`);
    const bytes = fs.readFileSync(file);
    const assetId = assetIdFor(bytes);
    fs.mkdirSync(ASSETS, { recursive: true });
    fs.writeFileSync(path.join(ASSETS, `${assetId}.png`), bytes);
    ctx.images.set(assetId, bytes.length);
    stem.push({ type: "image", assetId, alt: String(q.image_alt || "Diagram for this question").slice(0, 2000) });
  }
  return {
    externalId,
    type: "single_choice",
    subject,
    topics: [q.topic, q.sub_topic].map((t) => String(t ?? "").trim().slice(0, 100)).filter(Boolean),
    difficulty,
    stem,
    options: q.options.map((o, i) => ({ id: OPTION_IDS[i], content: toBlocks(stripOption(o)) })),
    answer: { correctOptionId: correct },
    explanation: toBlocks(q.explanation || "Solution to be added."),
    source: {
      kind: "original",
      reference: `OurMocks question repository (Avenger2007/Mock-Questions), ${sourceFile}`,
    },
  };
}

function writePaper(paper, file, ctx) {
  const parsed = testPaperSchema.safeParse(paper);
  if (!parsed.success) {
    ctx.failures.push(`${file}: ${parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    return;
  }
  const { blueprint, issues } = checkPaper(parsed.data);
  if (!blueprint || issues.length) {
    ctx.failures.push(`${file}: ${issues.slice(0, 3).map((i) => `${i.path} ${i.message}`).join("; ")}`);
    return;
  }
  for (const q of parsed.data.questions) {
    if (ctx.ids.has(q.externalId)) ctx.failures.push(`${file}: duplicate externalId ${q.externalId}`);
    ctx.ids.add(q.externalId);
  }
  ctx.papers.push({ file, data: parsed.data });
}

export function convertAll(repo) {
  const ctx = { papers: [], failures: [], dollarMaths: [], unbalanced: [], ids: new Set(), images: new Map(), imageDir: path.join(repo, "IISER", "images") };
  for (const [folder, subject] of Object.entries(CUET_FOLDERS)) {
    const dir = path.join(repo, "CUET", folder);
    for (const name of fs.readdirSync(dir).filter((n) => /TEST \d+\.json$/.test(n))) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
      const n = Number(data.test_number);
      if (!(n >= 1 && n <= 15)) continue;
      writePaper(
        {
          schemaVersion: "1.0", bundleType: "test_paper", exam: "cuet-ug", subject, testNumber: n,
          free: n === 1, language: "en",
          questions: data.questions.map((q) => convertQuestion(q, subject, name, ctx)),
        },
        path.join(OUT, "cuet-ug", subject, `test-${String(n).padStart(2, "0")}.json`),
        ctx,
      );
    }
  }
  const iatDir = path.join(repo, "IISER");
  for (let n = 1; n <= 25; n++) {
    const name = n === 1 ? "IAT TEST 1.json" : `IAT NEW TEST ${n}.json`;
    const data = JSON.parse(fs.readFileSync(path.join(iatDir, name), "utf8"));
    if (Number(data.test_number) !== n) throw new Error(`${name}: test_number ${data.test_number}`);
    writePaper(
      {
        schemaVersion: "1.0", bundleType: "test_paper", exam: "iiser-iat", testNumber: n,
        free: n === 1, language: "en",
        questions: data.questions.map((q) => {
          const subject = IAT_SECTIONS[q.section];
          if (!subject) throw new Error(`${q.id}: unknown section ${q.section}`);
          return convertQuestion(q, subject, name, ctx);
        }),
      },
      path.join(OUT, "iiser-iat", `test-${String(n).padStart(2, "0")}.json`),
      ctx,
    );
  }
  return ctx;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repo = process.argv[2];
  if (!repo) throw new Error("Usage: node scripts/import-mock-questions.mjs <repo path>");
  fs.mkdirSync(ASSETS, { recursive: true });
  const ctx = convertAll(repo);
  if (ctx.failures.length) {
    console.error(`${ctx.failures.length} validation failures; nothing written:`);
    for (const f of ctx.failures.slice(0, 30)) console.error("  " + f);
    process.exit(1);
  }
  fs.rmSync(path.join(OUT, "cuet-ug"), { recursive: true, force: true });
  fs.rmSync(path.join(OUT, "iiser-iat"), { recursive: true, force: true });
  for (const { file, data } of ctx.papers) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
  const cuet = ctx.papers.filter((p) => p.data.exam === "cuet-ug").length;
  const bytes = [...ctx.images.values()].reduce((a, b) => a + b, 0);
  console.log(`Wrote ${cuet} CUET + ${ctx.papers.length - cuet} IAT papers; ${ctx.ids.size} questions; ${ctx.images.size} unique images (${(bytes / 1048576).toFixed(1)} MB).`);
  console.log(`$-as-maths candidates: ${ctx.dollarMaths.length}`);
  for (const d of ctx.dollarMaths.slice(0, 40)) console.log("  " + d);
  console.log(`Unbalanced \\( \\): ${ctx.unbalanced.length} ${ctx.unbalanced.slice(0, 10).join(" ")}`);
}
