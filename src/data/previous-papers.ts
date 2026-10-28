import type { ExamKey } from "./catalog";
import type { OfficialLink } from "./exams";

// Only official sources are listed. Where an exam body publishes no public archive, the page says so
// instead of linking to unofficial copies.

export type PaperLink = { label: string; url: string };
export type PreviousPapers = {
  exam: ExamKey;
  summary: string;
  available: boolean;
  papers: { year: string; links: PaperLink[] }[];
  alternatives: string[];
  sources: OfficialLink[];
  checkedOn: string;
};

const NEST = "https://www.nestexam.in/qnsans";
const nestYear = (year: number, sessions?: number) => ({
  year: String(year),
  links: sessions
    ? Array.from({ length: sessions }, (_, i) => ({ label: `Session ${i + 1}`, url: `${NEST}/NEST-${year}-Session-${i + 1}.pdf` }))
    : [{ label: "Question paper", url: `${NEST}/NEST-${String(year).slice(2)}.pdf` }],
});

export const previousPapers: PreviousPapers[] = [
  {
    exam: "niser-nest",
    available: true,
    summary:
      "The official NEST website publishes past question papers for every year from 2007 to 2026, including both sessions for 2019–2024. They are the best practice material for NEST: same pattern, same setters.",
    papers: [
      nestYear(2026),
      nestYear(2025),
      nestYear(2024, 2),
      nestYear(2023, 2),
      nestYear(2022, 2),
      nestYear(2021, 2),
      nestYear(2020, 2),
      nestYear(2019, 2),
      ...[2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007].map((y) => nestYear(y)),
    ],
    alternatives: [
      "Older papers (before 2019) may differ from today's pattern of four 20-question sections; check each paper's instructions.",
      "Time yourself at 3 hours and don't use a calculator, as in the real exam.",
    ],
    sources: [{ label: "NEST official website: question paper archive", url: "https://www.nestexam.in/" }],
    checkedOn: "2026-10-28",
  },
  {
    exam: "cuet-ug",
    available: false,
    summary:
      "We could not find a public archive of past CUET UG question papers on NTA's website. During the answer-key window, NTA shows each candidate their own recorded responses and the provisional answer keys through the candidate login.",
    papers: [],
    alternatives: [
      "Use the official subject-wise syllabus as your checklist; questions follow the NCERT syllabus.",
      "Practise full 50-question, 60-minute papers on the official pattern — Test 1 is free in 12 subjects on OurMocks.",
      "Be careful with \"previous year paper\" PDFs from unofficial sites: they are often reconstructed from memory and may contain errors.",
    ],
    sources: [{ label: "CUET UG official website (NTA)", url: "https://cuet.nta.nic.in/" }],
    checkedOn: "2026-10-28",
  },
  {
    exam: "iiser-iat",
    available: false,
    summary:
      "We could not find an official archive of past IAT question papers. The IISERs provide a mock test on the admissions portal before the exam so candidates can practise the interface.",
    papers: [],
    alternatives: [
      "NEST's official past papers cover the same Class 11–12 Biology, Chemistry, Mathematics and Physics and are good practice for IAT.",
      "Practise 60-question papers in 3 hours across all four subjects, with +4/−1 marking.",
    ],
    sources: [{ label: "IISER admissions website", url: "https://www.iiseradmission.in/" }],
    checkedOn: "2026-10-28",
  },
  {
    exam: "comedk",
    available: false,
    summary:
      "COMEDK does not publish an archive of past UGET question papers on its website. It does offer an official mock test before the exam.",
    papers: [],
    alternatives: [
      "Use the official 2026 syllabus PDFs for Physics, Chemistry and Mathematics as your checklist.",
      "Practise 180-question papers in 3 hours and answer every question — there is no negative marking.",
    ],
    sources: [{ label: "COMEDK UGET 2026 (official)", url: "https://www.comedk.org/about-uget-and-notification-2026" }],
    checkedOn: "2026-10-28",
  },
];

export const previousPapersFor = (exam: string) => previousPapers.find((p) => p.exam === exam);
