import Link from "next/link";
import { notFound } from "next/navigation";
import { exams } from "@/data/exams";
import { siteConfig } from "@/data/catalog";
import { pageMetadata } from "@/lib/page-metadata";
import {
  ExamGuideArticle,
  OfficialAnchor,
} from "@/components/exam-guide-article";
import { JsonLd } from "@/components/json-ld";
import { CollegesShowcase } from "@/components/colleges-showcase";
import { SocialShare } from "@/components/social-share";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";

export const dynamicParams = false;
export const revalidate = 86400;
export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }));
}
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const exam = exams.find((exam) => exam.slug === slug);
  if (!exam) notFound();
  return pageMetadata(
    `${exam.name} 2026: eligibility, dates & opportunities`,
    `Explore ${exam.name} eligibility, exam pattern, syllabus, dates, opportunities and official application links. ${exam.verification === "partial" ? "Some live information remains unverified." : "Includes reviewed official sources."}`,
    `/exams/${slug}`,
  );
}
export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  const index = exams.findIndex((exam) => exam.slug === slug);
  if (index < 0) notFound();
  const exam = exams[index];
  const url = `${siteConfig.url}/exams/${slug}`;
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
              name: `${exam.name} 2026 exam guide`,
              description: exam.summary,
              inLanguage: "en-IN",
              isPartOf: { "@id": `${siteConfig.url}/#website` },
              breadcrumb: { "@id": `${url}#breadcrumb` },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteConfig.url,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Explore exams",
                  item: `${siteConfig.url}/exams`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: exam.name,
                  item: url,
                },
              ],
            },
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: [
                {
                  "@type": "Question",
                  name: `What is the eligibility for ${exam.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: exam.eligibility.join(" "),
                  },
                },
                {
                  "@type": "Question",
                  name: `What is the exam pattern for ${exam.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: exam.format,
                  },
                },
                {
                  "@type": "Question",
                  name: `What is the fee for ${exam.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: exam.fee,
                  },
                },
                {
                  "@type": "Question",
                  name: `How does admission work after ${exam.name}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: exam.admission,
                  },
                },
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
          <span aria-current="page">{exam.name}</span>
        </nav>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, marginBottom: "12px" }}>
          <Sparkles size={13} /> 2026 / 2027 Cycle Guidance Active
        </div>
        <p className="eyebrow">{exam.category} · Academic Reference</p>
        <h1>
          {exam.name}
          <br />
          <em>Your guide to the next step.</em>
        </h1>
        <p className="hero-copy">
          {exam.fullName}. Explore the opportunities, understand the
          requirements, discover top colleges, and find the official information you need.
        </p>
        <div className="hero-actions">
          <Link href="/free-diagnostic" className="button-primary">
            {slug === "cuet-ug" ? "Attempt Free Full Mock" : "Join Waitlist / Free Diagnostic"} <ArrowRight size={16} />
          </Link>
          <Link href={`/exams#${slug}`} className="text-link">
            Compare with all four exams →
          </Link>
        </div>
      </section>
      <div className="page-shell standalone-exam-guide">
        <SocialShare
          title={`${exam.name} 2026/2027 Official Guide: Eligibility, Top Colleges & Dates`}
          description={exam.summary}
        />

        <ExamGuideArticle
          exam={exam}
          index={index}
          now={new Date()}
          standalone
        />

        {/* Respective Colleges & Universities with Photos */}
        <CollegesShowcase
          examSlug={exam.slug}
          heading={`Top Universities & Colleges for ${exam.name}`}
          subheading={`Explore the premier institutes, campus photos, popular degree courses, and rankings unlocked by your ${exam.name} preparation.`}
          showFilters={false}
        />

        {/* Free Test or Waitlist CTA */}
        <section
          style={{
            background: "linear-gradient(135deg, #071A4D 0%, #1F5EFF 100%)",
            color: "#ffffff",
            borderRadius: "18px",
            padding: "36px",
            margin: "36px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "0 8px 24px rgba(7, 26, 77, 0.15)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#B8FF34",
                color: "#071A4D",
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              {slug === "cuet-ug" ? "13 Full Tests Free Live" : "Coming Soon · Adding in Upcoming Days"}
            </span>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", margin: "10px 0 6px 0" }}>
              {slug === "cuet-ug" ? "Attempt CUET UG Full-Length Test 1 Free" : `Get Notified When ${exam.name} Tests Go Live`}
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "560px" }}>
              {slug === "cuet-ug"
                ? "Timed 50-question official pattern test papers with real NTA CBT countdown, per-question timers, and detailed solutions."
                : `Our academic experts are preparing research-grade ${exam.name} mock tests. Join our priority waitlist for early access.`}
            </p>
          </div>
          <Link
            href="/free-diagnostic"
            style={{
              background: "#ffffff",
              color: "#071A4D",
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            {slug === "cuet-ug" ? "Attempt Free Test Now" : "Join Priority Waitlist"} <ArrowRight size={16} />
          </Link>
        </section>

        <section
          className="checklist-panel section-space"
          aria-labelledby="official-update-title"
        >
          <p className="eyebrow">Official updates</p>
          <h2 id="official-update-title">{exam.notification.title}</h2>
          <p className="mt-4">{exam.notification.detail}</p>
          <OfficialAnchor
            link={exam.notification.source}
            className="text-link mt-4"
          />
          <p className="review-note">
            Reference information reviewed {exam.checkedOn}. Check the official
            portal for later notices before acting.
          </p>
          <Link href="/exams#application-checklist" className="text-link mt-4">
            Before you apply: read the application checklist →
          </Link>
        </section>

        <SocialShare
          title={`${exam.name} Exam Guide: Admissions, Syllabus & Top Colleges`}
          description={exam.summary}
        />

        <nav className="related-exam-links" aria-label="Explore other exams">
          {exams
            .filter((other) => other.slug !== slug)
            .map((other) => (
              <Link
                key={other.slug}
                className="text-link"
                href={`/exams/${other.slug}`}
              >
                {other.name} guide →
              </Link>
            ))}
        </nav>
      </div>
    </main>
  );
}
