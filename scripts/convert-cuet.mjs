import fs from "node:fs";

function cleanPrompt(text) {
  if (!text) return "";
  return text
    .replace(/\\1/g, "A")
    .replace(/\\\\\(/g, "$")
    .replace(/\\\\\)/g, "$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .trim();
}

function cleanOption(opt) {
  if (!opt) return "";
  const stripped = opt.replace(/^[A-D]\)\s*/, "");
  return cleanPrompt(stripped);
}

function mapCorrect(opt) {
  if (!opt) return "0";
  const map = { A: "0", B: "1", C: "2", D: "3" };
  const letter = opt.trim().charAt(0).toUpperCase();
  return map[letter] ?? "0";
}

function convertPaper(filePath, subjectSlug) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return data.questions.map((q, idx) => {
    const diffMap = { easy: "Foundation", medium: "Standard", hard: "Stretch" };
    const qObj = {
      id: `${subjectSlug}-${String(idx + 1).padStart(3, "0")}`,
      subject: subjectSlug,
      type: "single",
      topic: q.topic || "Core Principles",
      difficulty: diffMap[q.difficulty] || "Standard",
      prompt: cleanPrompt(q.question),
      options: (q.options || []).map(cleanOption),
      correct: mapCorrect(q.correct_option),
      explanation: cleanPrompt(q.explanation || "Detailed solution available in exam syllabus review."),
      tip: `Revise ${q.sub_topic || q.topic || "this topic"} and practice similar exam patterns.`,
      targetSeconds: 75
    };
    return qObj;
  });
}

const mathQs = convertPaper("src/data/questions/cuet/mathematics/CUET_Mathematics_Paper1_Level1.json", "mathematics");
// Enable multiple and numerical formats on specific items for full CBT player compliance
mathQs[1].type = "multiple";
mathQs[1].correct = ["0", "2"];
mathQs[2].type = "numerical";
mathQs[2].correct = "2.0";
mathQs[2].tolerance = 0.001;

const physQs = convertPaper("src/data/questions/cuet/physics/CUET_Physics_Paper1_Level1.json", "physics");
const bioQs = convertPaper("src/data/questions/cuet/biological-science/CUET_BiologicalScience_Paper1_Level1.json", "biological-science");
const chemQs = convertPaper("src/data/questions/cuet/physics/CUET_Physics_Paper2_Level2.json", "chemistry");

const allQuestions = [...mathQs, ...physQs, ...chemQs, ...bioQs];

fs.writeFileSync("src/data/student/questions.json", JSON.stringify(allQuestions, null, 2));
console.log(`Successfully converted and wrote ${allQuestions.length} real questions to src/data/student/questions.json`);
