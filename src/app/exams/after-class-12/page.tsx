import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { OfficialAnchor } from "@/components/exam-guide-article";
import { siteConfig } from "@/data/catalog";
import { blogPosts } from "@/data/blog";
import { exams, formatReviewDate } from "@/data/exams";
import "./after-class-12.css";

// Hub for the "after 12th" cluster: every guide below links back here, and this page links to each one.
const AFTER_12TH_GUIDES = [
  "entrance-exams-after-12th-other-than-jee-neet",
  "best-colleges-other-than-iit-nit-nirf-2025",
  "courses-after-12th-science-pcm-without-jee",
  "options-after-12th-pcb-without-neet",
  "options-after-12th-commerce",
  "options-after-12th-arts-humanities",
  "government-universities-through-cuet-ug",
  "scholarships-after-12th-science",
  "gap-year-after-12th-which-exams-can-you-take",
  "time-per-question-analysis-mock-tests",
];

const guides = AFTER_12TH_GUIDES.map((slug) => blogPosts.find((post) => post.slug === slug)).filter(
  (post): post is (typeof blogPosts)[number] => post !== undefined,
);

const PATH = "/exams/after-class-12";
const URL_ = `${siteConfig.url}${PATH}`;
const PUBLISHED = "2026-10-14";
// Content last changed when /resources was merged in; the exam facts below carry their own checked dates.
const UPDATED = "2026-11-05";
const lastChecked = exams.map((e) => e.checkedOn).sort().at(-1)!;

const byStream = [
  {
    stream: "Science with Maths (PCM)",
    exams: "CUET UG, IISER IAT, NISER NEST, COMEDK UGET",
    guide: "courses-after-12th-science-pcm-without-jee",
  },
  {
    stream: "Science with Biology (PCB)",
    exams: "CUET UG, IISER IAT, NISER NEST",
    guide: "options-after-12th-pcb-without-neet",
  },
  { stream: "Commerce", exams: "CUET UG", guide: "options-after-12th-commerce" },
  { stream: "Arts and Humanities", exams: "CUET UG", guide: "options-after-12th-arts-humanities" },
];

// The answers below are shown word for word in the visible FAQ and in the FAQPage schema.
const FAQS = [
  {
    q: "Which entrance exams can I take after Class 12 other than JEE and NEET?",
    a: "CUET UG (for central, state and many private universities, open to every stream), IISER IAT and NISER NEST (research-focused science degrees) and COMEDK UGET (private engineering colleges in Karnataka). There are others too, such as CLAT, BITSAT, UCEED and NIFT; our stream-by-stream guide lists them with official links.",
  },
  {
    q: "Which of these exams can Commerce and Arts students take?",
    a: "CUET UG. Its domain papers include Accountancy, Business Studies, Economics, History, Political Science, Geography and more, and it leads to all 48 Central Universities. IAT and NEST need science subjects, and COMEDK needs Physics and Mathematics.",
  },
  {
    q: "Can I prepare for more than one of these exams at the same time?",
    a: "Yes, and most students do. IAT, NEST, COMEDK and CUET science papers all build on Class 11 and 12 science, so one strong base covers most of the syllabus. What changes is the number of questions, the time and the marking.",
  },
  {
    q: "Can I take these exams after a gap year?",
    a: "Often, yes. CUET UG has no age limit, and the 2026 IAT and NEST rules accepted Class 12 passouts of 2024 and 2025 as well as students appearing in 2026. Each exam publishes its rules every year, so confirm in the 2027 bulletin before you apply.",
  },
  {
    q: "Are the OurMocks practice tests free?",
    a: "Test 1 is free for every exam we cover. CUET UG Test 1 is live now; IAT, NEST and COMEDK Test 1 open as each paper is released. Each test follows the exam's official pattern and marking and ends with a time-per-question analysis.",
  },
];

export const metadata = pageMetadata(
  "Exams After Class 12 Other Than JEE and NEET",
  "Exams after Class 12 besides JEE and NEET: CUET UG for central universities, IAT and NEST for research science, COMEDK for Karnataka engineering.",
  PATH,
);

export default function AfterClass12GuidePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${URL_}#article`,
              headline: "Exams after Class 12 other than JEE and NEET",
              description:
                "Which entrance exams to take after Class 12 besides JEE and NEET, by stream: CUET UG, IISER IAT, NISER NEST and COMEDK UGET, with a five-step plan and official sources.",
              url: URL_,
              datePublished: PUBLISHED,
              dateModified: UPDATED,
              author: { "@type": "Organization", name: "OurMocks Editorial Team", url: `${siteConfig.url}/about` },
              publisher: { "@id": `${siteConfig.url}/#organization` },
              isPartOf: { "@id": `${siteConfig.url}/#website` },
              breadcrumb: { "@id": `${URL_}#breadcrumb` },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${URL_}#breadcrumb`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Explore exams", item: `${siteConfig.url}/exams` },
                { "@type": "ListItem", position: 3, name: "Exams after Class 12", item: URL_ },
              ],
            },
            {
              "@type": "FAQPage",
              "@id": `${URL_}#faq`,
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
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
          <span aria-current="page">Exams after Class 12</span>
        </nav>
        <p className="eyebrow">After Class 12</p>
        <h1>
          Exams after Class 12,
          <br />
          <em>beyond JEE and NEET.</em>
        </h1>
        <p className="hero-copy">
          JEE and NEET are two doors. Central universities, research institutes and engineering colleges run their own
          entrance tests too. Here is which ones fit your stream, and how to choose.
        </p>
        <div className="hero-actions">
          <Link href="/free-diagnostic" className="button-primary">
            Take free Test 1 <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/exams/compare" className="text-link">
            Compare the four exams <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="hero-tags">
          <span>
            <CheckCircle2 size={16} aria-hidden="true" /> Checked against official bulletins
          </span>
          <span>
            <CalendarDays size={16} aria-hidden="true" /> Last checked{" "}
            <time dateTime={lastChecked}>{formatReviewDate(lastChecked)}</time>
          </span>
        </div>
      </section>

      <div className="page-shell ac12-body">
        <section className="ac12-answer" aria-labelledby="ac12-answer-title">
          <h2 id="ac12-answer-title">The short answer</h2>
          <p>
            Besides JEE and NEET, four entrance exams open strong undergraduate routes. <strong>CUET UG</strong> is open
            to every stream and leads to all 48 Central Universities, including Delhi University, BHU and JNU.{" "}
            <strong>IISER IAT</strong> and <strong>NISER NEST</strong> lead to research-focused science degrees.{" "}
            <strong>COMEDK UGET</strong> leads to private engineering colleges in Karnataka. Most students take two or
            three, because the syllabi overlap.
          </p>
        </section>

        <section className="section-space ac12-section" aria-labelledby="ac12-stream-title">
          <h2 id="ac12-stream-title">Which exams fit your Class 12 stream?</h2>
          <p className="ac12-lede">
            Start with the subjects you studied. Individual courses can still ask for particular subjects, so check the{" "}
            <Link href="/exams/eligibility" className="text-link">
              eligibility for each exam
            </Link>{" "}
            before you pay a fee.
          </p>
          <div className="table-scroll" role="region" aria-label="Exams by stream" tabIndex={0}>
            <table className="ac12-table">
              <caption className="sr-only">Which of the four exams each Class 12 stream can take</caption>
              <thead>
                <tr>
                  <th scope="col">Your stream</th>
                  <th scope="col">Exams to consider</th>
                  <th scope="col">Full guide</th>
                </tr>
              </thead>
              <tbody>
                {byStream.map((row) => {
                  const post = blogPosts.find((p) => p.slug === row.guide);
                  return (
                    <tr key={row.stream}>
                      <th scope="row">{row.stream}</th>
                      <td>{row.exams}</td>
                      <td>
                        {post && (
                          <Link href={`/blog/${post.slug}`} className="text-link">
                            Options after {row.stream.replace(/ \(.+\)/, "")}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ac12-section" aria-labelledby="ac12-exams-title">
          <h2 id="ac12-exams-title">What does each exam lead to?</h2>
          <div className="ac12-exam-grid">
            {exams.map((exam) => (
              <article key={exam.slug} className={`ac12-exam theme-${exam.slug}`}>
                <p className="card-category">{exam.category}</p>
                <h3>{exam.name}</h3>
                <p>{exam.quickAnswer}</p>
                {exam.seats && <p className="ac12-meta">{exam.seats}</p>}
                <Link href={`/exams/${exam.slug}`} className="text-link ac12-card-link">
                  {exam.name} 2027 guide <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section-space ac12-section" aria-labelledby="ac12-plan-title">
          <h2 id="ac12-plan-title">How do you choose the right exams?</h2>
          <p className="ac12-lede">
            A short list of overlapping exams is easier to prepare for than a long, scattered one. Five steps, in order:
          </p>
          <ol className="ac12-steps">
            <li>
              <h3>Pick the degree first, then the exam</h3>
              <p>
                Write down two or three kinds of degree you would actually join. An exam is only useful if it leads
                there. The guides below, grouped by stream, help.
              </p>
            </li>
            <li>
              <h3>Compare the patterns</h3>
              <p>
                Questions, time and marking differ a lot: CUET and IAT have negative marking, COMEDK has none, and NEST
                counts your best three sections.{" "}
                <Link href="/exams/compare" className="text-link">
                  Compare CUET, IAT, NEST and COMEDK
                </Link>
              </p>
            </li>
            <li>
              <h3>Check you are eligible</h3>
              <p>
                Confirm the Class 12 marks, subjects and passing-year rules before you spend months preparing.{" "}
                <Link href="/exams/eligibility" className="text-link">
                  Check your eligibility
                </Link>
              </p>
            </li>
            <li>
              <h3>See where each exam leads</h3>
              <p>
                Look at the institutes that admit through each exam, with their official NIRF 2025 ranks.{" "}
                <Link href="/colleges" className="text-link">
                  Colleges by exam
                </Link>
              </p>
            </li>
            <li>
              <h3>Take one full test early</h3>
              <p>
                One timed paper shows whether you do better on fast questions (CUET, COMEDK) or longer problems (IAT,
                NEST), and where your time goes.{" "}
                <Link href="/free-diagnostic" className="text-link">
                  Free Test 1
                </Link>
              </p>
            </li>
          </ol>
        </section>

        <section className="ac12-section" aria-labelledby="ac12-guides-title">
          <h2 id="ac12-guides-title">What else do students ask after Class 12?</h2>
          <ul className="related-guides ac12-guides">
            {guides.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                <p>{post.description}</p>
              </li>
            ))}
          </ul>
          <p className="ac12-lede">
            Planning with numbers? Our{" "}
            <Link href="/tools" className="text-link">
              free tools
            </Link>{" "}
            include a score calculator, an eligibility checker and JEE Main and NEET predictors.
          </p>
        </section>

        <section className="section-space exam-faqs ac12-faq" aria-labelledby="ac12-faq-title">
          <h2 id="ac12-faq-title">Frequently asked questions</h2>
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="ac12-sources" aria-labelledby="ac12-sources-title">
          <h2 id="ac12-sources-title">Official sources</h2>
          <ul>
            {exams.map((exam) => (
              <li key={exam.slug}>
                <strong>{exam.name}:</strong> <OfficialAnchor link={exam.sources[0]} className="text-link" />
              </li>
            ))}
          </ul>
          <p className="review-note">
            Exam facts last checked against these sources on{" "}
            <time dateTime={lastChecked}>{formatReviewDate(lastChecked)}</time>. Page updated{" "}
            <time dateTime={UPDATED}>{formatReviewDate(UPDATED)}</time>. Official bulletins always take precedence.
            OurMocks is independent and not affiliated with NTA, the IISERs, NISER or COMEDK.
          </p>
        </section>

        <section className="exam-cta-band ac12-cta">
          <div>
            <h2>Not sure where you stand? Start with one full paper.</h2>
            <p>
              Test 1 is free for every exam we cover. CUET UG is live now; IAT, NEST and COMEDK open as each paper is
              released.
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
