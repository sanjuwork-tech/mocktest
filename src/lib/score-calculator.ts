import { blueprintFor } from "./blueprints/definitions.ts";
import type { ExamSlug, SubjectId } from "./exams/catalog.ts";

export type SectionEntry = { name: string; questions: number; marks: number; penalty: number; correct: number; wrong: number };

export type SectionScore = SectionEntry & {
  unanswered: number;
  score: number;
  max: number;
  lostToNegatives: number;
  counted: boolean;
  error?: string;
};

/** Sections a candidate fills in for an exam, with official marking from the blueprint. */
export function sectionsFor(exam: ExamSlug, cuetSubjects: SubjectId[] = []): Omit<SectionEntry, "correct" | "wrong">[] {
  if (exam === "cuet-ug")
    return cuetSubjects.map((subject) => {
      const s = blueprintFor("cuet-ug", subject)!.sections[0];
      return { name: s.name, questions: s.questionCount, marks: s.marksPerQuestion, penalty: s.penaltyPerQuestion };
    });
  return blueprintFor(exam)!.sections.map((s) => ({
    name: s.name,
    questions: s.questionCount,
    marks: s.marksPerQuestion,
    penalty: s.penaltyPerQuestion,
  }));
}

/** Scores each section under the official scheme; NEST counts only the best three sections. */
export function calculateScore(exam: ExamSlug, entries: SectionEntry[]) {
  const sections: SectionScore[] = entries.map((e) => {
    const correct = Math.max(0, Math.floor(e.correct || 0));
    const wrong = Math.max(0, Math.floor(e.wrong || 0));
    const error = correct + wrong > e.questions ? `Correct + wrong can't exceed ${e.questions}.` : undefined;
    return {
      ...e,
      correct,
      wrong,
      unanswered: Math.max(0, e.questions - correct - wrong),
      score: correct * e.marks - wrong * e.penalty,
      max: e.questions * e.marks,
      lostToNegatives: wrong * e.penalty,
      counted: true,
      error,
    };
  });

  const best = blueprintFor(exam, exam === "cuet-ug" ? "physics" : null)?.scoringPolicy.bestSections;
  let counted = sections;
  if (best && sections.length > best) {
    counted = [...sections].sort((a, b) => b.score - a.score).slice(0, best);
    for (const s of sections) s.counted = counted.includes(s);
  }

  const attempted = sections.reduce((n, s) => n + s.correct + s.wrong, 0);
  const correct = sections.reduce((n, s) => n + s.correct, 0);
  return {
    sections,
    total: counted.reduce((n, s) => n + s.score, 0),
    max: counted.reduce((n, s) => n + s.max, 0),
    accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
    lostToNegatives: counted.reduce((n, s) => n + s.lostToNegatives, 0),
    hasError: sections.some((s) => s.error),
    bestSections: best ?? null,
  };
}
