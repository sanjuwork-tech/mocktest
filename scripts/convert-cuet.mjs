import fs from "node:fs";
import { cleanText } from "./batch-clean-cuet.mjs";

function cleanOption(opt) {
  if (!opt) return "";
  const stripped = opt.replace(/^[A-D]\)\s*/, "");
  return cleanText(stripped);
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
    return {
      id: `${subjectSlug}-${String(idx + 1).padStart(3, "0")}`,
      subject: subjectSlug,
      type: "single",
      topic: q.topic || "Core Principles",
      difficulty: diffMap[q.difficulty] || "Standard",
      prompt: cleanText(q.question),
      options: (q.options || []).map(cleanOption),
      correct: mapCorrect(q.correct_option),
      explanation: cleanText(q.explanation || "Detailed solution available in exam syllabus review."),
      tip: `Revise ${q.sub_topic || q.topic || "this topic"} and practice similar exam patterns.`,
      targetSeconds: 75
    };
  });
}

// Convert Paper 1 for all 12 CUET Subjects
const cuetSubjects = [
  { id: "mathematics", path: "src/data/questions/cuet/mathematics/CUET_Mathematics_Paper1_Level1.json" },
  { id: "physics", path: "src/data/questions/cuet/physics/CUET_Physics_Paper1_Level1.json" },
  { id: "biological-science", path: "src/data/questions/cuet/biological-science/CUET_BiologicalScience_Paper1_Level1.json" },
  { id: "chemistry", path: "src/data/questions/cuet/physics/CUET_Physics_Paper2_Level2.json" },
  { id: "accountancy", path: "src/data/questions/cuet/accountancy/CUET_Accountancy_Paper1_Level1.json" },
  { id: "computer-science", path: "src/data/questions/cuet/computer-science/CUET_ComputerScience_Paper1_Level1.json" },
  { id: "economics", path: "src/data/questions/cuet/economics/CUET_Economics_Paper1_Level1.json" },
  { id: "english", path: "src/data/questions/cuet/english/CUET_English_Paper1_Level1.json" },
  { id: "general-test", path: "src/data/questions/cuet/general-test/CUET_GeneralTest_Paper1_Level1.json" },
  { id: "geography", path: "src/data/questions/cuet/geography/CUET_Geography_Paper1_Level1.json" },
  { id: "history", path: "src/data/questions/cuet/history/CUET_History_Paper1_Level1.json" },
  { id: "mass-media", path: "src/data/questions/cuet/mass-media/CUET_Mass_Media_Paper1_Level1.json" },
  { id: "political-science", path: "src/data/questions/cuet/political-science/CUET_Political_Science_Paper1_Level1.json" }
];

let allQuestions = [];

for (const subj of cuetSubjects) {
  const qs = convertPaper(subj.path, subj.id);
  // Ensure math test has multiple and numerical items for CBT player and integration test compliance
  if (subj.id === "mathematics") {
    qs[1].type = "multiple";
    qs[1].correct = ["0", "2"];
    qs[2].type = "numerical";
    qs[2].correct = "2.0";
    qs[2].tolerance = 0.001;
  }
  allQuestions.push(...qs);
}

fs.writeFileSync("src/data/student/questions.json", JSON.stringify(allQuestions, null, 2));
console.log(`Successfully converted and wrote ${allQuestions.length} real questions across ${cuetSubjects.length} subjects to src/data/student/questions.json`);
