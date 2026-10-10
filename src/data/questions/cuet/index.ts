import manifest from "./manifest.json" with { type: "json" };
import type { Question, QuestionType, Subject } from "@/lib/student/model";

export type CuetPaperMetadata = {
  file: string;
  testId: string;
  paperNumber: number;
  difficultyLevel: string;
  questionCount: number;
  durationMinutes: number;
};

export type CuetSubjectMetadata = {
  id: string;
  name: string;
  paperCount: number;
  questionCount: number;
  papers: CuetPaperMetadata[];
};

export type CuetManifest = {
  exam: string;
  totalSubjects: number;
  totalPapers: number;
  totalQuestions: number;
  subjects: CuetSubjectMetadata[];
};

export const cuetManifest = manifest as CuetManifest;

export function getCuetSubject(subjectId: string): CuetSubjectMetadata | undefined {
  return cuetManifest.subjects.find((s) => s.id === subjectId);
}

export function listCuetSubjects(): CuetSubjectMetadata[] {
  return cuetManifest.subjects;
}
