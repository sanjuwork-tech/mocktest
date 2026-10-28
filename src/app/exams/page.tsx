import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2 } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { exams, formatReviewDate } from "@/data/exams";
import { OfficialAnchor } from "@/components/exam-guide-article";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/catalog";

export const revalidate = 86400;
export const metadata = pageMetadata(
  "CUET, IAT, NEST & COMEDK 2027 Exam Guides",
  "Four entrance exams beyond JEE and NEET in one place: what each exam is, its official pattern and marking, who it admits to, and what is known about 2027.",
  "/exams",
);

const QUESTIONS: Record<string, string> = {
  "cuet-ug": "50 per paper; up to 5 papers",
  "iiser-iat": "60 (15 per subject)",
  "niser-nest": "80 (20 per section; best 3 sections count)",
  comedk: "180 (60 per subject)",
};

const pick = (rows: { label: string; value: string }[], label: string) =>
  rows.find((r) => r.label === label)?.value ?? "—";

export default function ExamsPage() {
  const lastReviewed = exams.map((e) => e.checkedOn).sort().at(-1)!;
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Exam guides: CUET UG, IISER IAT, NISER NEST, COMEDK UGET",
          url: `${siteConfig.url}/exams`,
          dateModified: lastReviewed,
          hasPart: exams.map((exam) => ({
            "@type": "WebPage",
            name: `${exam.name} 2027 exam guide`,
            url: `${siteConfig.url}/exams/${exam.slug}`,
          })),
        }}
      />
      <section className="guide-hero page-shell">
        <p className="eyebrow">Exam guides</p>
        <h1>
          Four exams beyond
          <br />
          <em>JEE and NEET.</em>
        </h1>
        <p className="hero-copy">
          CUET UG opens central universities, IAT and NEST lead to research-focused science degrees, and COMEDK
          covers private engineering colleges in Karnataka. Start with what each exam is, then open its full guide.
        </p>
        <div className="hero-tags">
          <span>
            <CheckCircle2 size={16} /> Checked against official bulletins
          </span>
          <span>
            <BookOpen size={16} /> Official 2026 patterns
          </span>
          <span>
            <CalendarDays size={16} /> Verified {formatReviewDate(lastReviewed)}
          </span>
        </div>
      </section>

      <section className="page-shell exam-hub" aria-label="Exam guides">
        {exams.map((exam) => (
          <article key={exam.slug} className={`exam-hub-card theme-${exam.slug}`} id={exam.slug}>
            <p className="eyebrow">{exam.category}</p>
            <h2>{exam.name}</h2>
            <p>{exam.quickAnswer}</p>
            <Link href={`/exams/${exam.slug}`} className="button-primary">
              {exam.name} 2027 guide <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </section>

      <section className="page-shell section-space" aria-labelledby="at-a-glance">
        <h2 id="at-a-glance">At a glance (2026 official patterns)</h2>
        <div className="table-scroll">
          <table className="glance-table">
            <caption className="sr-only">Exam pattern comparison</caption>
            <thead>
              <tr>
                <th scope="col">Exam</th>
                <th scope="col">Questions</th>
                <th scope="col">Duration</th>
                <th scope="col">Marking</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.slug}>
                  <th scope="row">
                    <Link href={`/exams/${exam.slug}`}>{exam.name}</Link>
                  </th>
                  <td>{QUESTIONS[exam.slug]}</td>
                  <td>{pick(exam.pattern, "Duration")}</td>
                  <td>{pick(exam.pattern, "Marking")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          <Link href="/exams/compare" className="text-link">
            Full side-by-side comparison →
          </Link>{" "}
          <Link href="/exams/eligibility" className="text-link">
            Eligibility for each exam →
          </Link>
        </p>
      </section>

      <section id="notifications" className="page-shell section-space" aria-labelledby="notifications-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest official status</p>
            <h2 id="notifications-title">Where each exam stands now</h2>
          </div>
        </div>
        <div className="notice-grid">
          {exams.map((exam) => (
            <article key={exam.slug} className="notice-card">
              <span className="eyebrow">{exam.name}</span>
              <h3>{exam.notification.title}</h3>
              <p>{exam.notification.detail}</p>
              <OfficialAnchor link={exam.notification.source} className="text-link" />
              <p className="review-note">Checked {formatReviewDate(exam.checkedOn)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="application-checklist" className="page-shell checklist-panel section-space">
        <p className="eyebrow">Before you apply</p>
        <h2>
          A little preparation.
          <br />A clearer application.
        </h2>
        <ol>
          {[
            "Shortlist the course and institution, then check the exact eligibility and required subjects.",
            "Read the current-cycle bulletin and confirm that registration is open on the official site.",
            "Prepare the documents, photo and signature in the formats requested by the organiser.",
            "Review your details, pay only through the official portal and save the confirmation page.",
            "Track correction windows, admit cards, results and counselling separately.",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p className="mt-5 text-sm">
          Admission, scholarships and career outcomes depend on the programme and its conditions. OurMocks helps you
          discover and understand these routes; it does not guarantee a seat.
        </p>
        <Link href="/free-diagnostic" className="button-primary mt-5">
          Practise with a free mock test <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
