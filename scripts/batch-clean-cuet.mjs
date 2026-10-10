import fs from "node:fs";
import path from "node:path";

export function cleanText(raw) {
  if (!raw || typeof raw !== "string") return raw;
  let text = raw.trim();

  // 1. Fix regex replacement artifacts from source dataset (e.g. \1 -> A)
  text = text.replace(/\\1/g, "A");

  // 2. Fix corrupted matrix questions where A = |A| or \left| A \right|
  if (
    text.includes("entry of AB") &&
    (text.includes("A = |A|") ||
      text.includes("A = \\left| A \\right|") ||
      text.includes("A = | A |") ||
      text.includes("A = \\left|") ||
      text.includes("A = |"))
  ) {
    text = text.replace(
      /A\s*=\s*(?:\\left\|\s*)?[|A\s]+(?:\s*\\right\|)?\s*and\s*B\s*=\s*(?:\\left\|\s*)?[|A\s]+(?:\s*\\right\|)?/g,
      "A = [[1, 0], [0, 1]] and B = [[2, 0], [0, 1]]"
    );
  }
  if (text.includes("The (1,1) entry is 2") && text.includes("AB =")) {
    text = text.replace(
      /AB\s*=\s*.*?\. The \(1,1\) entry is 2\./g,
      "AB = [[2, 0], [0, 1]]. The (1,1) entry is 2."
    );
  }

  // 3. Detect if entire string was mistakenly wrapped in math delimiters \( ... \) or $ ... $
  const startsWithParen = text.startsWith("\\(") || text.startsWith("\\\\(");
  const endsWithParen = text.endsWith("\\)") || text.endsWith("\\\\)");
  const startsWithDollar = text.startsWith("$");
  const endsWithDollar = text.endsWith("$");

  if ((startsWithParen && endsWithParen) || (startsWithDollar && endsWithDollar)) {
    const startOffset = startsWithDollar ? 1 : (text.startsWith("\\\\(") ? 3 : 2);
    const endOffset = endsWithDollar ? 1 : (text.endsWith("\\\\)") ? 3 : 2);
    const inner = text.slice(startOffset, -endOffset).trim();
    // Count space-separated alphabetic words of length >= 2
    const englishWords = inner.split(/\s+/).filter((w) => /^[a-zA-Z]{2,}$/.test(w));
    if (englishWords.length >= 2) {
      // Natural language sentence unwrapped!
      text = inner;
    }
  }

  // 4. Unwrap any embedded \( ... \) that contain natural language sentences
  text = text.replace(/\\\\?\(\s*([\s\S]*?)\s*\\\\?\)/g, (match, formula) => {
    const words = formula.split(/\s+/).filter((w) => /^[a-zA-Z]{2,}$/.test(w));
    if (words.length >= 2) {
      return formula.trim();
    }
    return `$${formula.trim()}$`;
  });

  // 5. Convert LaTeX delimiter macros \left and \right to clean readable brackets/bars
  text = text
    .replace(/\\left\|/g, "|")
    .replace(/\\right\|/g, "|")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\left\\\{/g, "{")
    .replace(/\\right\\\}/g, "}")
    .replace(/\\left\./g, "")
    .replace(/\\right\./g, "")
    .replace(/\\ln\b/g, "ln")
    .replace(/\\det\b/g, "det")
    .replace(/\\exp\b/g, "exp");

  // 6. Convert plain-text LaTeX symbols to clean, readable Unicode
  text = text
    .replace(/\\times\b/g, "×")
    .replace(/\\in\b/g, "∈")
    .replace(/\\notin\b/g, "∉")
    .replace(/\\subset\b/g, "⊂")
    .replace(/\\subseteq\b/g, "⊆")
    .replace(/\\cap\b/g, "∩")
    .replace(/\\cup\b/g, "∪")
    .replace(/\\pi\b/g, "π")
    .replace(/\\theta\b/g, "θ")
    .replace(/\\alpha\b/g, "α")
    .replace(/\\beta\b/g, "β")
    .replace(/\\lambda\b/g, "λ")
    .replace(/\\Delta\b/g, "Δ")
    .replace(/\\sum\b/g, "∑")
    .replace(/\\int\b/g, "∫")
    .replace(/\\pm\b/g, "±")
    .replace(/\\mp\b/g, "∓")
    .replace(/\\leq\b/g, "≤")
    .replace(/\\geq\b/g, "≥")
    .replace(/\\neq\b/g, "≠")
    .replace(/\\approx\b/g, "≈")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\rightarrow\b/g, "→")
    .replace(/\\to\b/g, "→")
    .replace(/\\sin\b/g, "sin")
    .replace(/\\cos\b/g, "cos")
    .replace(/\\tan\b/g, "tan")
    .replace(/\\log\b/g, "log");

  // 7. Wrap standalone \sqrt and \frac in $ ... $
  text = text.replace(/(\\sqrt\{[^{}]+\})/g, "$$1$");
  text = text.replace(/(\\frac\{[^{}]+\}\{[^{}]+\})/g, "$$1$");

  return text.trim();
}

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile() && entry.name.startsWith("CUET_") && entry.name.endsWith(".json")) {
      callback(fullPath);
    }
  }
}

const baseDir = "src/data/questions/cuet";
let totalFiles = 0;
let totalQuestions = 0;
let modifiedQuestions = 0;

walkDir(baseDir, (filePath) => {
  totalFiles++;
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  let changed = false;

  for (const q of data.questions || []) {
    totalQuestions++;
    const oldQ = q.question;
    const newQ = cleanText(oldQ);
    if (oldQ !== newQ) {
      q.question = newQ;
      changed = true;
      modifiedQuestions++;
    }

    const oldExp = q.explanation;
    const newExp = cleanText(oldExp);
    if (oldExp !== newExp) {
      q.explanation = newExp;
      changed = true;
    }

    if (Array.isArray(q.options)) {
      const oldOpts = JSON.stringify(q.options);
      q.options = q.options.map(cleanText);
      if (oldOpts !== JSON.stringify(q.options)) {
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }
});

console.log(`Successfully checked ${totalFiles} CUET papers with ${totalQuestions} questions.`);
console.log(`Cleaned and formatted ${modifiedQuestions} questions with unwrapped formulas & clean math!`);
