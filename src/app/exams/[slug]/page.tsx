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
        <p className="eyebrow">{exam.category} · 2026 reference cycle</p>
        <h1>
          {exam.name}
          <br />
          <em>Your guide to the next step.</em>
        </h1>
        <p className="hero-copy">
          {exam.fullName}. Explore the opportunities, understand the
          requirements and find the official information you need.
        </p>
        <div className="hero-actions">
          <Link href={`/exams#${slug}`} className="text-link">
            Compare with all four exams →
          </Link>
          <Link href="/test-series" className="button-primary">
            Explore our mock tests →
          </Link>
        </div>
      </section>
      <div className="page-shell standalone-exam-guide">
        <ExamGuideArticle
          exam={exam}
          index={index}
          now={new Date()}
          standalone
        />
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
