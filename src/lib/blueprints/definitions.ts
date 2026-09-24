import type { ExamBlueprint } from "./types.ts";

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
  sections: [
    {
      id: "biology",
      name: "Biology",
      subject: "biology",
      required: true,
      questionCount: 15,
      marksPerQuestion: 4,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "chemistry",
      name: "Chemistry",
      subject: "chemistry",
      required: true,
      questionCount: 15,
      marksPerQuestion: 4,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "mathematics",
      name: "Mathematics",
      subject: "mathematics",
      required: true,
      questionCount: 15,
      marksPerQuestion: 4,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "physics",
      name: "Physics",
      subject: "physics",
      required: true,
      questionCount: 15,
      marksPerQuestion: 4,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
  ],
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

export const NEST_2026_BLUEPRINT: ExamBlueprint = {
  id: "nest-2026",
  examSlug: "niser-nest",
  cycleYear: 2026,
  title: "National Entrance Screening Test (NEST) 2026 Pattern",
  durationMinutes: 180,
  totalQuestions: 80,
  totalMarks: 240,
  navigation: "free",
  allowBacktracking: true,
  sections: [
    {
      id: "biology",
      name: "Biology",
      subject: "biology",
      required: true,
      questionCount: 20,
      marksPerQuestion: 3,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "chemistry",
      name: "Chemistry",
      subject: "chemistry",
      required: true,
      questionCount: 20,
      marksPerQuestion: 3,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "mathematics",
      name: "Mathematics",
      subject: "mathematics",
      required: true,
      questionCount: 20,
      marksPerQuestion: 3,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "physics",
      name: "Physics",
      subject: "physics",
      required: true,
      questionCount: 20,
      marksPerQuestion: 3,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
  ],
  scoringPolicy: {
    unansweredMarks: 0,
    explanationRelease: "immediate",
  },
  officialSource: {
    title: "Official NEST 2026 Brochure and Syllabus",
    url: "https://www.nestexam.in/docs/26/NEST2026_Brochure_Syllabus_Updated_12Jan2026.pdf?v=1.1",
    checkedOn: "2026-09-13",
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
  sections: [
    {
      id: "physics",
      name: "Physics",
      subject: "physics",
      required: true,
      questionCount: 60,
      marksPerQuestion: 1,
      penaltyPerQuestion: 0, // No negative marking
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "chemistry",
      name: "Chemistry",
      subject: "chemistry",
      required: true,
      questionCount: 60,
      marksPerQuestion: 1,
      penaltyPerQuestion: 0,
      permittedAnswerTypes: ["single_choice"],
    },
    {
      id: "mathematics",
      name: "Mathematics",
      subject: "mathematics",
      required: true,
      questionCount: 60,
      marksPerQuestion: 1,
      penaltyPerQuestion: 0,
      permittedAnswerTypes: ["single_choice"],
    },
  ],
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

export const CUET_UG_2026_BLUEPRINT: ExamBlueprint = {
  id: "cuet-ug-2026-math",
  examSlug: "cuet-ug",
  cycleYear: 2026,
  title: "CUET UG 2026 Domain Paper — Mathematics",
  durationMinutes: 60,
  totalQuestions: 50,
  totalMarks: 250,
  navigation: "free",
  allowBacktracking: true,
  sections: [
    {
      id: "mathematics",
      name: "Mathematics",
      subject: "mathematics",
      required: true,
      questionCount: 50,
      marksPerQuestion: 5,
      penaltyPerQuestion: 1,
      permittedAnswerTypes: ["single_choice"],
    },
  ],
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

export const BLUEPRINT_PRESETS: Record<string, ExamBlueprint> = {
  "iiser-iat-2026": IISER_IAT_2026_BLUEPRINT,
  "niser-nest-2026": NEST_2026_BLUEPRINT,
  "comedk-2026": COMEDK_2026_BLUEPRINT,
  "cuet-ug-2026": CUET_UG_2026_BLUEPRINT,
};

export function getBlueprint(id: string): ExamBlueprint | undefined {
  return BLUEPRINT_PRESETS[id];
}
