// Single source of truth for the exams, subjects and planned test counts the platform offers.
// Safe to import from client and server code: it contains no questions or answers.

export const SUBJECT_IDS = [
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "accountancy",
  "computer-science",
  "economics",
  "english",
  "general-test",
  "geography",
  "history",
  "mass-media",
  "political-science",
] as const;

export type SubjectId = (typeof SUBJECT_IDS)[number];

export const SUBJECT_NAMES: Record<SubjectId, string> = {
  mathematics: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  accountancy: "Accountancy",
  "computer-science": "Computer Science",
  economics: "Economics",
  english: "English",
  "general-test": "General Aptitude Test",
  geography: "Geography",
  history: "History",
  "mass-media": "Mass Media",
  "political-science": "Political Science",
};

/** Display details for subject cards; `code` is the NTA CUET subject code. */
export const SUBJECT_DETAILS: Record<SubjectId, { subtitle: string; color: string; code: string }> = {
  mathematics: { subtitle: "Find the logic. Build your confidence.", color: "#1f5eff", code: "319" },
  physics: { subtitle: "Turn the world around you into understanding.", color: "#406900", code: "322" },
  chemistry: { subtitle: "Small connections. Stronger concepts.", color: "#a63b22", code: "306" },
  biology: { subtitle: "Explore genetics, cell biology, and ecosystems.", color: "#059669", code: "304" },
  accountancy: { subtitle: "Master partnership, share capital, and financial statements.", color: "#d97706", code: "301" },
  "computer-science": { subtitle: "Python programming, SQL databases, and computer networks.", color: "#2563eb", code: "308" },
  economics: { subtitle: "Microeconomics, macroeconomics, and Indian economic development.", color: "#0d9488", code: "309" },
  english: { subtitle: "Reading comprehension, vocabulary, and verbal aptitude.", color: "#7c3aed", code: "101" },
  "general-test": { subtitle: "Quantitative aptitude, logical reasoning, and current affairs.", color: "#dc2626", code: "501" },
  geography: { subtitle: "Physical geography, human landscapes, and spatial analysis.", color: "#16a34a", code: "313" },
  history: { subtitle: "Ancient heritage, medieval epochs, and modern nation building.", color: "#b45309", code: "314" },
  "mass-media": { subtitle: "Journalism, cinema, advertising, and digital communication.", color: "#9333ea", code: "318" },
  "political-science": { subtitle: "Indian constitution, politics, and contemporary world affairs.", color: "#0284c7", code: "323" },
};

export const EXAM_SLUGS = ["cuet-ug", "iiser-iat", "niser-nest", "comedk"] as const;
export type ExamSlug = (typeof EXAM_SLUGS)[number];

export type ExamDefinition = {
  slug: ExamSlug;
  name: string;
  shortName: string;
  /** CUET is sat one subject paper at a time; the others are single multi-section papers. */
  paperPerSubject: boolean;
  subjects: SubjectId[];
  /** Planned tests per subject (CUET) or per exam (others). */
  plannedTests: number;
  /** Maximum subjects a candidate takes (CUET only). */
  maxSubjects?: number;
};

export const EXAMS: Record<ExamSlug, ExamDefinition> = {
  "cuet-ug": {
    slug: "cuet-ug",
    name: "CUET UG",
    shortName: "CUET",
    paperPerSubject: true,
    subjects: [...SUBJECT_IDS],
    plannedTests: 25,
    maxSubjects: 5,
  },
  "iiser-iat": {
    slug: "iiser-iat",
    name: "IISER Aptitude Test (IAT)",
    shortName: "IAT",
    paperPerSubject: false,
    subjects: ["biology", "chemistry", "mathematics", "physics"],
    plannedTests: 35,
  },
  "niser-nest": {
    slug: "niser-nest",
    name: "NISER NEST",
    shortName: "NEST",
    paperPerSubject: false,
    subjects: ["biology", "chemistry", "mathematics", "physics"],
    plannedTests: 35,
  },
  comedk: {
    slug: "comedk",
    name: "COMEDK UGET",
    shortName: "COMEDK",
    paperPerSubject: false,
    subjects: ["physics", "chemistry", "mathematics"],
    plannedTests: 35,
  },
};

export function isExamSlug(value: string): value is ExamSlug {
  return (EXAM_SLUGS as readonly string[]).includes(value);
}

export function isSubjectId(value: string): value is SubjectId {
  return (SUBJECT_IDS as readonly string[]).includes(value);
}
