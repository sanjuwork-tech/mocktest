import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { EligibilityChecker } from "@/components/eligibility-checker";
import { OfficialAnchor } from "@/components/exam-guide-article";
import { exams, formatReviewDate } from "@/data/exams";
import { siteConfig } from "@/data/catalog";
import "@/components/guide-page.css";
import "./eligibility.css";

export const metadata = pageMetadata(
  "Eligibility for CUET, IAT, NEST & COMEDK 2027",
  "Class 12 marks, subjects, passing year and age rules for CUET UG, IISER IAT, NEST and COMEDK UGET, from the official 2026 bulletins.",
  "/exams/eligibility",
  [
    "CUET eligibility criteria 2026",
    "IISER IAT eligibility marks",
    "NEST exam age limit",
    "COMEDK percentage required in 12th",
    "entrance exam eligibility checker",
  ],
);

const ELIGIBILITY_DATA = [
  {
    slug: "cuet-ug",
    exam: "CUET (UG)",
    badge: "Most flexible",
    authority: "National Testing Agency (NTA)",
    minMarks: "A pass in Class 12. NTA sets no minimum; some university programmes (such as DU BMS or BCom) ask for 50–60%.",
    streamRequired: "Any stream. The 2026 bulletin allows papers irrespective of Class 12 subjects, but a university can require specific subjects for a course.",
    ageLimit: "No upper or lower age limit imposed by NTA (individual universities may have age conditions).",
    attemptLimit: "NTA sets no attempt limit; each university decides whether it admits earlier passouts.",
    domicileQuota: "All-India open competition for Central Universities; state quota applies only to state universities.",
  },
  {
    slug: "iiser-iat",
    exam: "IISER Aptitude Test (IAT)",
    badge: "Science only",
    authority: "The IISERs (joint admission)",
    minMarks: "At least 60% aggregate marks (55% for SC, ST, PwD) or equivalent grade in Class 12.",
    streamRequired: "Science stream with at least three subjects among Biology, Chemistry, Mathematics and Physics.",
    ageLimit: "No age limit is stated; eligibility depends on the year you passed Class 12.",
    attemptLimit: "2026 cycle: Class 12 (or a 3-year diploma) passed in 2024, 2025 or 2026, or appearing in 2026, so three cohorts.",
    domicileQuota: "All-India admission to the 7 IISERs; IISc (BS Research) and IIT Madras (4-year BS) also used IAT 2026, with their own applications.",
  },
  {
    slug: "niser-nest",
    exam: "National Entrance Screening Test (NEST)",
    badge: "Basic science",
    authority: "NISER Bhubaneswar and UM-DAE CEBS",
    minMarks: "At least 60% aggregate marks (55% for SC, ST, Divyangjan) in Class 12 examination.",
    streamRequired: "Science stream in regular school mode with at least 3 subjects out of PCM/B.",
    ageLimit: "No age limit (as per the official NEST information brochure).",
    attemptLimit: "2026 cycle: Class 12 passed in 2024 or 2025, or appearing in 2026.",
    domicileQuota: "All-India admission. Admitted students are eligible for the DAE DISHA scholarship (₹60,000 a year plus ₹20,000 a year for summer internships).",
  },
  {
    slug: "comedk",
    exam: "COMEDK UGET",
    badge: "Engineering",
    authority: "COMEDK Karnataka",
    minMarks: "At least 45% aggregate in Physics, Mathematics and the optional subject (Chemistry, Biology or Computer Science); 40% for Karnataka SC/ST/OBC.",
    // English added to match src/data/exams.ts and src/lib/eligibility.ts.
    streamRequired: "Physics, Mathematics and English are compulsory, along with Chemistry, Biology or Computer Science.",
    ageLimit: "COMEDK states that B.E./B.Tech eligibility follows AICTE and VTU norms; it does not set a separate age limit.",
    attemptLimit: "COMEDK does not state an attempt limit; earlier passouts are eligible as per AICTE/VTU norms.",
    domicileQuota: "Open to students from all states across India (non-Karnataka candidates are eligible for private seats).",
  },
];

const RULES: { key: "minMarks" | "streamRequired" | "ageLimit" | "attemptLimit" | "domicileQuota"; label: string }[] = [
  { key: "minMarks", label: "How much do you need in Class 12?" },
  { key: "streamRequired", label: "Which stream and subjects?" },
  { key: "ageLimit", label: "Is there an age limit?" },
  { key: "attemptLimit", label: "Which passing years qualify?" },
  { key: "domicileQuota", label: "Can you apply from any state?" },
];

const FAQS = [
  {
    q: "Can droppers or gap-year students write these exams?",
    a: "Mostly, yes. CUET and COMEDK set no passing-year limit of their own. In 2026, IAT accepted Class 12 passouts of 2024, 2025 and 2026, and NEST accepted 2024 and 2025 passouts plus students appearing in 2026.",
  },
  {
    q: "Can PCB students take IISER IAT or NEST without Maths?",
    a: "Yes, for the main programmes: IISER BS-MS and the NISER/CEBS Integrated M.Sc need any three of Biology, Chemistry, Mathematics and Physics. Both tests still include a Mathematics section, and some programmes (such as IISER B.Tech or economics degrees) require Mathematics, so check the bulletin for each.",
  },
  {
    q: "Can non-Karnataka students get seats through COMEDK?",
    a: "Yes. COMEDK is an all-India exam, and seats are allotted by COMEDK rank through its centralised counselling. Karnataka SC/ST/OBC candidates get a lower qualifying aggregate (40% instead of 45%).",
  },
];

const url = `${siteConfig.url}/exams/eligibility`;
const checkedOn = exams.map((e) => e.checkedOn).sort()[0];

export default function EligibilityGuidePage() {
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
              name: "Entrance exam eligibility criteria: CUET UG, IISER IAT, NEST and COMEDK",
              description: "Class 12 percentage, subjects, passing year and age rules from the official 2026 bulletins.",
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
                { "@type": "ListItem", position: 3, name: "Eligibility", item: url },
              ],
            },
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
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
          <span aria-current="page">Eligibility</span>
        </nav>
        <p className="eyebrow">Class 12 and droppers</p>
        <h1>
          Entrance exam eligibility <em>criteria (2026/2027)</em>
        </h1>
        <p className="gp-answer">
          CUET UG has no NTA marks, stream or age limit. IISER IAT and NISER NEST need three of Physics, Chemistry,
          Maths and Biology with 60% in Class 12 (55% for SC/ST/PwD). COMEDK needs Physics, Maths and English plus one
          optional science, with 45% (40% for Karnataka SC/ST/OBC).
        </p>
      </section>

      <div className="page-shell elig-page">
        <EligibilityChecker />

        <section className="gp-section" aria-labelledby="elig-rules-title">
          <h2 id="elig-rules-title">What are the rules for each exam?</h2>
          <p className="gp-lede">From the 2026 bulletins. The 2027 rules may change; confirm in each bulletin before you apply.</p>
          <ul className="elig-cards">
            {ELIGIBILITY_DATA.map((item) => (
              <li key={item.slug} className={`theme-${item.slug}`}>
                <p className="elig-card-top">
                  <span className="elig-badge">{item.badge}</span>
                  <span>{item.authority}</span>
                </p>
                <h3>{item.exam}</h3>
                <dl>
                  {RULES.map((rule) => (
                    <div key={rule.key}>
                      <dt>{rule.label}</dt>
                      <dd>{item[rule.key]}</dd>
                    </div>
                  ))}
                </dl>
                <p className="gp-links elig-card-links">
                  <Link href={`/exams/${item.slug}`} className="text-link">
                    Full guide <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    href={item.slug === "cuet-ug" ? "/free-diagnostic" : `/free-diagnostic?exam=${item.slug}#waitlist`}
                    className="text-link"
                  >
                    {item.slug === "cuet-ug" ? "Take a free CUET test" : "Join the waitlist"}{" "}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="gp-section exam-faqs elig-faqs" aria-labelledby="elig-faq-title">
          <h2 id="elig-faq-title">Common eligibility questions</h2>
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="gp-sources" aria-labelledby="elig-sources-title">
          <h2 id="elig-sources-title">Where do these rules come from?</h2>
          <p>Each exam&apos;s official 2026 bulletin or brochure:</p>
          <ul>
            {exams.map((exam) => (
              <li key={exam.slug}>
                <OfficialAnchor link={{ ...exam.sources[0], label: `${exam.name}: ${exam.sources[0].label}` }} />
              </li>
            ))}
          </ul>
          <p>
            Last verified against these sources on <time dateTime={checkedOn}>{formatReviewDate(checkedOn)}</time>. The
            checker runs in your browser and sends nothing anywhere. OurMocks is independent and not affiliated with any
            exam body; the official bulletin always takes precedence.
          </p>
        </section>

        <section className="exam-cta-band gp-next" aria-labelledby="elig-next-title">
          <div>
            <span className="badge-lime">Next step</span>
            <h2 id="elig-next-title">Eligible? See how ready you are</h2>
            <p>
              Take a full CUET paper free, marked like the real exam, with a section and topic breakdown. IAT, NEST and
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
