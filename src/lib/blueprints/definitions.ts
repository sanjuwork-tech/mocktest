import type { ExamBlueprint, SectionBlueprint } from "./types.ts";
import {
  EXAMS,
  SUBJECT_NAMES,
  type ExamSlug,
  type SubjectId,
} from "../exams/catalog.ts";

// Official patterns for the current cycle. Update these (not the UI) when a new bulletin changes the pattern.

function section(
  subject: SubjectId,
  questionCount: number,
  marksPerQuestion: number,
  penaltyPerQuestion: number,
): SectionBlueprint {
  return {
    id: subject,
    name: SUBJECT_NAMES[subject],
    subject,
    optional: false,
    questionCount,
    marksPerQuestion,
    penaltyPerQuestion,
    permittedAnswerTypes: ["single_choice"],
  };
}

export const IISER_IAT_2026_BLUEPRINT: ExamBlueprint = {
  id: "iiser-iat-2026",
  examSlug: "iiser-iat",
  cycleYear: 2026,
  title: "IISER Aptitude Test (IAT) 2026 Official Pattern",
  durationMinutes: 180,
  totalQuestions: 60,
  totalMarks: 240,
  navigation: "free",
  allowBacktracking: true,
  sections: EXAMS["iiser-iat"].subjects.map((s) => section(s, 15, 4, 1)),
  scoringPolicy: {
    unansweredMarks: 0,
    explanationRelease: "immediate",
  },
  officialSource: {
    title: "Official IAT 2026 Information Bulletin",
    url: "https://www.iiseradmission.in/assets/pdfs/IB_IAT_2026_ENG.pdf",
    checkedOn: "2026-09-13",
  },
};

// NEST 2026 brochure §14: four 60-mark sections (+3/−1/0), total = sum of the best three sections.
export const NEST_2026_BLUEPRINT: ExamBlueprint = {
  id: "nest-2026",
  examSlug: "niser-nest",
  cycleYear: 2026,
  title: "National Entrance Screening Test (NEST) 2026 Pattern",
  durationMinutes: 180,
  totalQuestions: 80,
  totalMarks: 180,
  navigation: "free",
  allowBacktracking: true,
  sections: EXAMS["niser-nest"].subjects.map((s) => section(s, 20, 3, 1)),
  scoringPolicy: {
    unansweredMarks: 0,
    bestSections: 3,
    explanationRelease: "immediate",
  },
  officialSource: {
    title: "Official NEST 2026 Brochure and Syllabus",
    url: "https://www.nestexam.in/docs/26/NEST2026_Brochure_Syllabus_Updated_12Jan2026.pdf?v=1.1",
    checkedOn: "2026-10-27",
  },
};

export const COMEDK_2026_BLUEPRINT: ExamBlueprint = {
  id: "comedk-2026",
  examSlug: "comedk",
  cycleYear: 2026,
  title: "COMEDK UGET 2026 Pattern",
  durationMinutes: 180,
  totalQuestions: 180,
  totalMarks: 180,
  navigation: "free",
  allowBacktracking: true,
  sections: EXAMS.comedk.subjects.map((s) => section(s, 60, 1, 0)),
  scoringPolicy: {
    unansweredMarks: 0,
    explanationRelease: "immediate",
  },
  officialSource: {
    title: "COMEDK Official Exam Scheme",
    url: "https://www.comedk.org/",
    checkedOn: "2026-09-13",
  },
};

// NTA syllabus papers with a compulsory Section A and a choice of B1 or B2 (CUET UG 2026 syllabi 301, 308, 319).
const CUET_OPTIONAL_SECTIONS: Partial<Record<SubjectId, [a: number, b: number, names: [string, string, string]]>> = {
  accountancy: [40, 10, ["Section A — Units I to IV", "Section B1 — Analysis of Financial Statements", "Section B2 — Computerised Accounting System"]],
  mathematics: [15, 35, ["Section A — Common", "Section B1 — Mathematics", "Section B2 — Applied Mathematics"]],
  "computer-science": [15, 35, ["Section A — Database, SQL and Networks", "Section B1 — Computer Science", "Section B2 — Informatics Practices"]],
};

function cuetSections(subject: SubjectId): SectionBlueprint[] {
  const split = CUET_OPTIONAL_SECTIONS[subject];
  if (!split) return [section(subject, 50, 5, 1)];
  const [a, b, names] = split;
  return (["A", "B1", "B2"] as const).map((id, i) => ({
    ...section(subject, i ? b : a, 5, 1),
    id,
    name: names[i],
    optional: i > 0,
  }));
}

// CUET UG: each subject is its own 50-question, 60-minute paper marked +5/−1/0.
// Counts describe what a candidate attempts: Section A plus one optional section.
export function cuetBlueprint(subject: SubjectId): ExamBlueprint {
  return {
    id: `cuet-ug-2026-${subject}`,
    examSlug: "cuet-ug",
    cycleYear: 2026,
    title: `CUET UG 2026 — ${SUBJECT_NAMES[subject]}`,
    durationMinutes: 60,
    totalQuestions: 50,
    totalMarks: 250,
    navigation: "free",
    allowBacktracking: true,
    sections: cuetSections(subject),
    scoringPolicy: {
      unansweredMarks: 0,
      explanationRelease: "immediate",
    },
    officialSource: {
      title: "NTA CUET UG 2026 Information Bulletin",
      url: "https://cuet.nta.nic.in/",
      checkedOn: "2026-09-13",
    },
  };
}

export const CUET_UG_2026_BLUEPRINT = cuetBlueprint("physics");

export const BLUEPRINT_PRESETS: Record<string, ExamBlueprint> = {
  "iiser-iat-2026": IISER_IAT_2026_BLUEPRINT,
  "niser-nest-2026": NEST_2026_BLUEPRINT,
  "comedk-2026": COMEDK_2026_BLUEPRINT,
  ...Object.fromEntries(
    EXAMS["cuet-ug"].subjects.map((s) => [`cuet-ug-2026-${s}`, cuetBlueprint(s)]),
  ),
};

export function getBlueprint(id: string): ExamBlueprint | undefined {
  return BLUEPRINT_PRESETS[id];
}

/** The blueprint a paper must follow: per subject for CUET, one per exam otherwise. */
export function blueprintFor(exam: ExamSlug, subject?: SubjectId | null) {
  if (exam === "cuet-ug") return subject ? cuetBlueprint(subject) : undefined;
  if (exam === "iiser-iat") return IISER_IAT_2026_BLUEPRINT;
  if (exam === "niser-nest") return NEST_2026_BLUEPRINT;
  return COMEDK_2026_BLUEPRINT;
}

/** Whether a paper question belongs to a blueprint section: by section id when the paper names one, else by subject. */
export function inSection(q: { subject: string; section?: string }, s: SectionBlueprint) {
  return q.section ? q.section === s.id : q.subject === s.subject;
}
