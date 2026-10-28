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
import { blogPosts } from "@/data/blog";
import { ArrowRight } from "lucide-react";

export const dynamicParams = false;
export const revalidate = 86400;
export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }));
}
type Props = { params: Promise<{ slug: string }> };

function description(text: string) {
  return text.length <= 158 ? text : `${text.slice(0, text.lastIndexOf(" ", 155))}…`;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const exam = exams.find((exam) => exam.slug === slug);
  if (!exam) notFound();
  return pageMetadata(
    `${exam.name} 2027: Pattern, Eligibility & Dates`,
    description(exam.quickAnswer),
    `/exams/${slug}`,
  );
}

export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  const index = exams.findIndex((exam) => exam.slug === slug);
  if (index < 0) notFound();
  const exam = exams[index];
  const url = `${siteConfig.url}/exams/${slug}`;
  const freeTestLive = slug === "cuet-ug";
  const cta = freeTestLive
    ? { href: "/free-diagnostic", label: "Take a free CUET mock test" }
    : { href: `/free-diagnostic?exam=${slug}#waitlist`, label: `Get notified when ${exam.name} mocks open` };
  const guides = blogPosts.filter((post) => post.examSlug === slug);

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
              name: `${exam.name} 2027 exam guide`,
              description: exam.quickAnswer,
              inLanguage: "en-IN",
              dateModified: exam.checkedOn,
              isPartOf: { "@id": `${siteConfig.url}/#website` },
              breadcrumb: { "@id": `${url}#breadcrumb` },
              about: { "@type": "Thing", name: exam.fullName },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Explore exams", item: `${siteConfig.url}/exams` },
                { "@type": "ListItem", position: 3, name: exam.name, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: exam.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
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
          <span aria-current="page">{exam.name}</span>
        </nav>
        <p className="eyebrow">{exam.category}</p>
        <h1>
          {exam.name} 2027
          <br />
          <em>exam guide.</em>
        </h1>
        <p className="hero-copy">
          {exam.fullName}: pattern, eligibility, where it leads and what is known about the 2027 cycle — checked
          against the official sources.
        </p>
        <div className="hero-actions">
          <Link href={cta.href} className="button-primary">
            {cta.label} <ArrowRight size={16} />
          </Link>
          <Link href="/exams/compare" className="text-link">
            Compare all four exams →
          </Link>
        </div>
        <nav className="exam-quicklinks" aria-label={`${exam.name} resources`}>
          <Link href={`/exams/${slug}/syllabus`}>Syllabus</Link>
          <Link href={`/exams/${slug}/previous-year-papers`}>Previous year papers</Link>
          <Link href={`/tools/score-calculator?exam=${slug}`}>Score calculator</Link>
        </nav>
      </section>
      <div className="page-shell standalone-exam-guide">
        <ExamGuideArticle exam={exam} index={index} now={new Date()} standalone />

        <CollegesShowcase
          examSlug={exam.slug}
          heading={`Institutes that admit through ${exam.name}`}
          subheading="Verified admission routes, official rankings and links to each institute's own website."
          showFilters={false}
        />

        <section className="exam-cta-band">
          <div>
            <span className="badge-lime">{freeTestLive ? "Free · official pattern" : "Mocks in preparation"}</span>
            <h2>
              {freeTestLive ? "Try a full CUET paper, free" : `Be first to practise ${exam.name} mocks`}
            </h2>
            <p>
              {freeTestLive
                ? "50 questions, 60 minutes, +5/−1 — then a section and topic analysis with worked solutions."
                : `We're building full-length ${exam.name} mocks on the official pattern. Leave your email and we'll tell you when they open.`}
            </p>
          </div>
          <Link href={cta.href} className="button-light">
            {freeTestLive ? "Start free test" : "Join the waitlist"} <ArrowRight size={16} />
          </Link>
        </section>

        <section className="checklist-panel section-space" aria-labelledby="official-update-title">
          <p className="eyebrow">Latest official status</p>
          <h2 id="official-update-title">{exam.notification.title}</h2>
          <p className="mt-4">{exam.notification.detail}</p>
          <OfficialAnchor link={exam.notification.source} className="text-link mt-4" />
          <Link href="/exams#application-checklist" className="text-link mt-4">
            Before you apply: read the application checklist →
          </Link>
        </section>

        {guides.length > 0 && (
          <section className="section-space" aria-labelledby="guides-title">
            <h2 id="guides-title">{exam.name} guides</h2>
            <ul className="related-guides">
              {guides.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  <p>{post.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <SocialShare
          url={url}
          title={`${exam.name} 2027 exam guide: pattern, eligibility & dates`}
          description={exam.quickAnswer}
        />

        <nav className="related-exam-links" aria-label="Explore other exams">
          {exams
            .filter((other) => other.slug !== slug)
            .map((other) => (
              <Link key={other.slug} className="text-link" href={`/exams/${other.slug}`}>
                {other.name} guide →
              </Link>
            ))}
          <Link className="text-link" href="/exams/eligibility">
            Eligibility for all four exams →
          </Link>
        </nav>
      </div>
    </main>
  );
}
