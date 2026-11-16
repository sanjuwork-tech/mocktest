import { EXAMS, EXAM_SLUGS, SUBJECT_NAMES, type ExamSlug, type SubjectId } from "../lib/exams/catalog.ts";
import { syllabusFor, type SyllabusGroup } from "./syllabus.ts";

/** One price for every subject of every exam. Payments are not live, so nothing can be bought yet. */
export const NOTES_PRICE = 149;
export const NOTES_CURRENCY = "INR";

export const NOTES_EXAM_NAMES: Record<ExamSlug, string> = {
  "cuet-ug": "CUET UG",
  "iiser-iat": "IISER IAT",
  "niser-nest": "NISER NEST",
  comedk: "COMEDK UGET",
};

export type Note = {
  /** Unique id, also the tail of the waitlist interest: "cuet-ug-physics". */
  slug: string;
  exam: ExamSlug;
  examName: string;
  subject: SubjectId;
  subjectName: string;
  price: number;
  /** Unit groups copied from the official syllabus data; empty when the exam publishes no unit list (IAT). */
  groups: SyllabusGroup[];
  unitCount: number;
  path: string;
  /** Value stored in the waitlist table. */
  interest: string;
};

function build(exam: ExamSlug, subject: SubjectId): Note {
  const groups = syllabusFor(exam)?.subjects.find((s) => s.id === subject)?.groups ?? [];
  return {
    slug: `${exam}-${subject}`,
    exam,
    examName: NOTES_EXAM_NAMES[exam],
    subject,
    subjectName: SUBJECT_NAMES[subject],
    price: NOTES_PRICE,
    groups,
    unitCount: groups.reduce((n, g) => n + g.units.length, 0),
    path: `/notes/${exam}/${subject}`,
    interest: `notes-${exam}-${subject}`,
  };
}

export const notes: Note[] = EXAM_SLUGS.flatMap((exam) => EXAMS[exam].subjects.map((subject) => build(exam, subject)));

export const notesFor = (exam: string) => notes.filter((n) => n.exam === exam);
export const noteFor = (exam: string, subject: string) => notes.find((n) => n.exam === exam && n.subject === subject);
export const isNotesExam = (value: string): value is ExamSlug => (EXAM_SLUGS as readonly string[]).includes(value);

/** "12 units" or, when the exam prints no unit list, a plain Class 11–12 line. */
export const coverage = (note: Note) =>
  note.unitCount ? `${note.unitCount} ${note.unitCount === 1 ? "unit" : "units"}` : "Class 11–12 syllabus";

/** Every waitlist interest the notes pages can send: all notes, one exam, or one subject. */
export const NOTES_INTERESTS: readonly string[] = [
  "notes-all",
  ...EXAM_SLUGS.map((e) => `notes-${e}`),
  ...notes.map((n) => n.interest),
];
export const isNotesInterest = (value: unknown): value is string =>
  typeof value === "string" && NOTES_INTERESTS.includes(value);

/** A mix of exams for the landing page teaser. */
export const FEATURED_NOTE_SLUGS = [
  "cuet-ug-physics",
  "cuet-ug-mathematics",
  "iiser-iat-biology",
  "niser-nest-chemistry",
  "comedk-mathematics",
  "cuet-ug-english",
];
export const featuredNotes = () =>
  FEATURED_NOTE_SLUGS.map((s) => notes.find((n) => n.slug === s)).filter((n): n is Note => Boolean(n));

export const NOTES_FAQS = [
  {
    q: "Can I buy the notes now?",
    a: "Not yet. Payments are not live, so nothing can be bought today. Leave your email on any notes page and we will write to you when the notes open. Joining is free and commits you to nothing.",
  },
  {
    q: "Why is every subject ₹149?",
    a: "One flat price keeps it simple: any subject, any exam, ₹149. We would rather you can add a second or third subject without doing sums. The price is the planned price and will be confirmed when the notes open.",
  },
  {
    q: "What will the notes cover?",
    a: "Each set is written to the official syllabus for that subject, as printed by the exam body. The unit list on every subject page is copied from our syllabus data, so you can see what a set is built around before you decide.",
  },
  {
    q: "Who writes the notes?",
    a: "They are prepared by the OurMocks team as concise revision notes by subject. They are a revision aid, not a replacement for your textbooks or for the official bulletin.",
  },
  {
    q: "Can I try something free first?",
    a: "Yes. Test 1 of every exam we cover is free, so you can see where you stand before spending anything. CUET UG Test 1 is live now; IAT, NEST and COMEDK Test 1 open as each paper is released.",
  },
  {
    q: "Is OurMocks connected to the exam bodies?",
    a: "No. OurMocks is an independent practice platform and is not affiliated with NTA, the IISERs, NISER, UM-DAE CEBS or COMEDK. Always confirm rules and dates in the official bulletin.",
  },
];

// Search titles and descriptions live here so tests can check their lengths (titles <= 60, descriptions <= 155).
const price = `₹${NOTES_PRICE}`;
export const hubMeta = {
  title: `Affordable Exam Notes: ${price} Per Subject`,
  description: `All resources in one place: low-budget subject notes for CUET UG, IISER IAT, NISER NEST and COMEDK, ${price} each. Cheap but worth it. Opening soon.`,
};
export const examMeta = (exam: ExamSlug) => ({
  title: `${NOTES_EXAM_NAMES[exam]} Notes: ${price} Per Subject`,
  description: `Affordable ${NOTES_EXAM_NAMES[exam]} notes for ${EXAMS[exam].subjects.length} subjects, ${price} each, written to the official syllabus. Opening soon: get notified.`,
});
export const subjectMeta = (note: Note) => ({
  title: `${note.examName} ${note.subjectName} Notes: ${price}`,
  description: `${note.examName} ${note.subjectName} notes at ${price}, written to the official syllabus. A low-budget revision aid, opening soon: get notified.`,
});

export const subjectFaqs = (note: Note) => [
  {
    q: `When can I buy the ${note.examName} ${note.subjectName} notes?`,
    a: `Not yet. Payments are not live, so nothing can be bought today. Add your email on this page and we will write to you when the ${note.subjectName} notes open.`,
  },
  {
    q: `What does the ${price} cover?`,
    a: `One subject of one exam: ${note.examName} ${note.subjectName}. The price is the planned price and will be confirmed when the notes open.`,
  },
  {
    q: `Which syllabus are the ${note.subjectName} notes written to?`,
    a: note.unitCount
      ? `The official ${note.examName} syllabus. The ${note.unitCount} units listed on this page are copied from our syllabus data, which is transcribed from the exam body's own document.`
      : `${note.examName} publishes no unit-wise syllabus, so we do not present one as official. The notes follow the Class 11 and 12 ${note.subjectName} that the exam is set from; check the official brochure for the latest rules.`,
  },
  {
    q: "Is there anything free to try first?",
    a: `Yes. Test 1 is free for ${note.examName}${note.exam === "cuet-ug" ? ", and it is live now" : ", and it opens when the paper is released"}.`,
  },
];
