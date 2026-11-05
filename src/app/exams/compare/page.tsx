import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { OfficialAnchor } from "@/components/exam-guide-article";
import { exams, formatReviewDate } from "@/data/exams";
import { siteConfig } from "@/data/catalog";
import {
  COMEDK_2026_BLUEPRINT,
  CUET_UG_2026_BLUEPRINT,
  IISER_IAT_2026_BLUEPRINT,
  NEST_2026_BLUEPRINT,
} from "@/lib/blueprints/definitions";
import type { ExamBlueprint } from "@/lib/blueprints/types";
import "@/components/guide-page.css";
import "./compare.css";

export const metadata = pageMetadata(
  "CUET vs IAT vs NEST vs COMEDK: 2027 Comparison",
  "CUET UG, IISER IAT, NEST and COMEDK side by side: courses, subjects, questions, duration, marking and eligibility from the official 2026 bulletins.",
  "/exams/compare",
  [
    "CUET vs IAT",
    "IISER IAT vs NEST",
    "COMEDK vs CUET",
    "entrance exam comparison 2026",
    "exams after 12th science",
    "best exams after class 12",
  ],
);

type Col = "cuet" | "iat" | "nest" | "comedk";

const EXAM_COLUMNS: { key: Col; slug: string; name: string; leadsTo: string }[] = [
  { key: "cuet", slug: "cuet-ug", name: "CUET UG", leadsTo: "Central universities" },
  { key: "iat", slug: "iiser-iat", name: "IISER IAT", leadsTo: "BS-MS research" },
  { key: "nest", slug: "niser-nest", name: "NISER NEST", leadsTo: "Integrated MSc" },
  { key: "comedk", slug: "comedk", name: "COMEDK UGET", leadsTo: "Karnataka engineering" },
];

// Question counts, duration and marking come from the official blueprints, never hard-coded here.
const BLUEPRINTS: Record<Col, ExamBlueprint> = {
  cuet: CUET_UG_2026_BLUEPRINT,
  iat: IISER_IAT_2026_BLUEPRINT,
  nest: NEST_2026_BLUEPRINT,
  comedk: COMEDK_2026_BLUEPRINT,
};

function questionsAndTime(col: Col) {
  const bp = BLUEPRINTS[col];
  const perSection = bp.sections[0].questionCount;
  const split = bp.sections.length > 1 ? ` (${perSection} per subject)` : " per paper";
  const time = bp.durationMinutes >= 120 ? `${bp.durationMinutes / 60} hours` : `${bp.durationMinutes} minutes`;
  return `${bp.totalQuestions} questions${split}, ${time}${bp.sections.length > 1 ? "" : " each"}`;
}

function marking(col: Col) {
  const bp = BLUEPRINTS[col];
  const s = bp.sections[0];
  const rule = s.penaltyPerQuestion
    ? `+${s.marksPerQuestion} correct, −${s.penaltyPerQuestion} wrong, 0 unanswered`
    : `+${s.marksPerQuestion} correct, no negative marking`;
  const best = bp.scoringPolicy.bestSections;
  const total = best
    ? `best ${best} sections count, maximum ${bp.totalMarks}`
    : `maximum ${bp.totalMarks}${bp.sections.length > 1 ? "" : " per paper"}`;
  return `${rule}; ${total}`;
}

const COMPARISON_ROWS: ({ feature: string } & Record<Col, string>)[] = [
  {
    feature: "Courses it leads to",
    cuet: "Undergraduate programmes (BA, BSc, BCom and more) at 48 Central Universities plus participating state, deemed and private universities",
    iat: "5-year BS-MS at 7 IISERs; also IISc 4-year BS (Research), IIT Madras 4-year BS, IIT Guwahati, IACS Kolkata and IIEST Shibpur programmes",
    nest: "5-year Integrated MSc in basic sciences at NISER Bhubaneswar and UM-DAE CEBS Mumbai (DAE institutions)",
    comedk: "4-year B.E./B.Tech at about 150 private engineering colleges in Karnataka (around 20,000 seats)",
  },
  {
    feature: "Conducted by",
    cuet: "National Testing Agency (NTA)",
    iat: "The IISERs (joint admission)",
    nest: "NISER Bhubaneswar and UM-DAE CEBS Mumbai",
    comedk: "COMEDK (Consortium of Medical, Engineering and Dental Colleges of Karnataka)",
  },
  {
    feature: "Subjects tested",
    cuet: "Domain subjects (such as Physics, Maths, Accountancy), languages and the optional General Aptitude Test; up to 5 papers",
    iat: "Biology, Chemistry, Mathematics and Physics, all compulsory",
    nest: "Biology, Chemistry, Mathematics and Physics; your best three sections count",
    comedk: "Physics, Chemistry and Mathematics, all compulsory",
  },
  {
    feature: "Questions and duration",
    cuet: questionsAndTime("cuet"),
    iat: questionsAndTime("iat"),
    nest: questionsAndTime("nest"),
    comedk: questionsAndTime("comedk"),
  },
  {
    feature: "Marking scheme",
    cuet: marking("cuet"),
    iat: marking("iat"),
    nest: marking("nest"),
    comedk: marking("comedk"),
  },
  {
    feature: "Class 12 eligibility",
    // Follows src/data/exams.ts: the 2026 bulletin lets candidates pick papers irrespective of Class 12 subjects.
    cuet: "Class 12 passed or appearing. NTA sets no marks, stream or age limit; each university sets its own course requirements",
    iat: "Science stream with at least 60% aggregate (55% for SC/ST/PwD); Class 12 in 2024, 2025 or 2026",
    nest: "Science stream with at least 60% aggregate (55% for SC/ST/Divyangjan); Class 12 in 2024 or 2025, or appearing in 2026. No age limit",
    // Follows src/data/exams.ts and src/lib/eligibility.ts: English is also compulsory.
    comedk: "Physics, Mathematics and English, plus Chemistry, Biology or Computer Science; at least 45% aggregate in Physics, Maths and the optional subject (40% for Karnataka SC/ST/OBC)",
  },
  {
    feature: "Syllabus basis",
    cuet: "NCERT-based, per the official subject-wise syllabus",
    iat: "Class 11–12 Biology, Chemistry, Mathematics and Physics",
    nest: "Class 11–12 science, primarily CBSE/NCERT (detailed in the brochure)",
    comedk: "CBSE: about one-third Class 11 and two-thirds Class 12",
  },
  {
    feature: "Free mock on OurMocks",
    cuet: "Free full-length Test 1 in 12 subjects",
    iat: "In preparation; join the waitlist",
    nest: "In preparation; join the waitlist",
    comedk: "In preparation; join the waitlist",
  },
];

const CHOOSE: { slug: string; name: string; text: string }[] = [
  {
    slug: "cuet-ug",
    name: "CUET UG",
    text: "You want a place at a central university such as DU, BHU, JNU or the University of Hyderabad, for arts, commerce, science or BCA degrees, chosen through subject-wise papers.",
  },
  {
    slug: "iiser-iat",
    name: "IISER IAT",
    text: "You enjoy the natural sciences and want a research-oriented degree: BS-MS at the 7 IISERs, or the 4-year BS at IISc or IIT Madras.",
  },
  {
    slug: "niser-nest",
    name: "NISER NEST",
    text: "You want a 5-year Integrated MSc at the Department of Atomic Energy institutes, NISER Bhubaneswar or UM-DAE CEBS Mumbai. Admitted students are eligible for the DISHA scholarship of ₹60,000 a year plus ₹20,000 a year for summer internships.",
  },
  {
    slug: "comedk",
    name: "COMEDK UGET",
    text: "You want an alternative to JEE Main for private engineering colleges in Bengaluru and across Karnataka (such as RVCE, BMSCE and MSRIT), on a paper with no negative marking.",
  },
];

const url = `${siteConfig.url}/exams/compare`;
// The oldest review date among the four guides is the honest "last checked" date for the whole table.
const checkedOn = exams.map((e) => e.checkedOn).sort()[0];

export default function CompareExamsPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${url}#webpage`,
              url,
              name: "CUET UG vs IISER IAT vs NEST vs COMEDK",
              description:
                "Side-by-side comparison of CUET UG, IISER IAT, NISER NEST and COMEDK UGET from the official 2026 bulletins.",
              inLanguage: "en-IN",
              dateModified: checkedOn,
              breadcrumb: { "@id": `${url}#breadcrumb` },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Explore exams", item: `${siteConfig.url}/exams` },
                { "@type": "ListItem", position: 3, name: "Compare exams", item: url },
              ],
            },
          ],
        }}
      />

      <section className="guide-hero page-shell">
        <nav aria-label="Breadcrumb" className="exam-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/exams">Explore exams</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Compare exams</span>
        </nav>
        <p className="eyebrow">Beyond JEE and NEET</p>
        <h1 className="xc-title">
          CUET UG vs IISER IAT <em>vs NEST vs COMEDK</em>
        </h1>
        <p className="gp-answer">
          CUET UG opens undergraduate courses at central and other universities, one 50-question paper per subject.
          IISER IAT and NISER NEST lead to research-focused science degrees and test all four sciences. COMEDK UGET fills
          private engineering seats in Karnataka and is the only one with no negative marking.
        </p>
      </section>

      <div className="page-shell xc-body">
        <section className="xc-section" aria-labelledby="xc-table-title">
          <h2 id="xc-table-title" className="gp-h2">
            How do the four exams compare?
          </h2>
          <p className="gp-lede">
            The 2026 official pattern for each exam. The 2027 bulletins are not out yet; we update this table when they
            are.
          </p>
          <table className="xc-table" role="table" aria-labelledby="xc-table-title">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">
                  <span className="sr-only">What is compared</span>
                </th>
                {EXAM_COLUMNS.map((c) => (
                  <th key={c.key} scope="col" role="columnheader" className={`theme-${c.slug}`}>
                    {c.name}
                    <span>{c.leadsTo}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody role="rowgroup">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} role="row">
                  <th scope="row" role="rowheader">
                    {row.feature}
                  </th>
                  {EXAM_COLUMNS.map((c) => (
                    <td key={c.key} role="cell" data-label={c.name} className={`theme-${c.slug}`}>
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="xc-section" aria-labelledby="xc-choose-title">
          <h2 id="xc-choose-title" className="gp-h2">
            Which exam should you choose?
          </h2>
          <p className="gp-lede">
            Many students write more than one. Start from the degree you want, then check you are eligible.
          </p>
          <ul className="xc-choose">
            {CHOOSE.map((c) => (
              <li key={c.slug} className={`theme-${c.slug}`}>
                <h3>Choose {c.name} if</h3>
                <p>{c.text}</p>
                <Link href={`/exams/${c.slug}`} className="text-link">
                  {c.name} guide <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="gp-links xc-more">
            <Link href="/exams/eligibility" className="text-link">
              Check your eligibility for all four <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/colleges" className="text-link">
              See the colleges each exam leads to <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="gp-sources" aria-labelledby="xc-sources-title">
          <h2 id="xc-sources-title">Where do these facts come from?</h2>
          <p>Each exam&apos;s official 2026 bulletin or brochure:</p>
          <ul>
            {exams.map((exam) => (
              <li key={exam.slug}>
                <OfficialAnchor link={{ ...exam.sources[0], label: `${exam.name}: ${exam.sources[0].label}` }} />
              </li>
            ))}
          </ul>
          <p>
            Last verified against these sources on <time dateTime={checkedOn}>{formatReviewDate(checkedOn)}</time>.
            OurMocks is independent and not affiliated with NTA, the IISERs, NISER or COMEDK; the official notice always
            takes precedence.
          </p>
        </section>

        <section className="exam-cta-band gp-next" aria-labelledby="xc-next-title">
          <div>
            <span className="badge-lime">Free · official pattern</span>
            <h2 id="xc-next-title">Try a full CUET paper, free</h2>
            <p>
              50 questions, 60 minutes, marked like the real exam, then a section and topic analysis. IAT, NEST and
              COMEDK mocks are in preparation.
            </p>
          </div>
          <Link href="/free-diagnostic" className="button-light">
            Take free Test 1 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
