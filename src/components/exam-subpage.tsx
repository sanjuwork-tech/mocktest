import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/catalog";
import type { ExamGuide } from "@/data/exams";

/** Shared frame for an exam's sub-pages (syllabus, previous papers): breadcrumb, schema and sibling links. */
export function ExamSubpage({
  exam,
  path,
  name,
  title,
  lede,
  dateModified,
  children,
}: {
  exam: ExamGuide;
  path: string;
  name: string;
  title: ReactNode;
  lede: string;
  dateModified: string;
  children: ReactNode;
}) {
  const url = `${siteConfig.url}/exams/${exam.slug}/${path}`;
  const siblings = [
    { href: `/exams/${exam.slug}`, label: `${exam.name} exam guide` },
    { href: `/exams/${exam.slug}/syllabus`, label: `${exam.name} syllabus` },
    { href: `/exams/${exam.slug}/previous-year-papers`, label: `${exam.name} previous year papers` },
    { href: `/tools/score-calculator?exam=${exam.slug}`, label: `${exam.name} score calculator` },
  ].filter((link) => !link.href.endsWith(`/${path}`));

  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebPage", "@id": `${url}#webpage`, url, name: `${exam.name} ${name}`, description: lede, dateModified, inLanguage: "en-IN" },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Explore exams", item: `${siteConfig.url}/exams` },
                { "@type": "ListItem", position: 3, name: exam.name, item: `${siteConfig.url}/exams/${exam.slug}` },
                { "@type": "ListItem", position: 4, name, item: url },
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
          <Link href={`/exams/${exam.slug}`}>{exam.name}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{name}</span>
        </nav>
        <p className="eyebrow">{exam.fullName}</p>
        <h1>{title}</h1>
        <p className="hero-copy">{lede}</p>
      </section>
      <div className={`page-shell exam-subpage theme-${exam.slug}`}>
        {children}
        <nav className="related-exam-links" aria-label={`More on ${exam.name}`}>
          {siblings.map((link) => (
            <Link key={link.href} className="text-link" href={link.href}>
              {link.label} →
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
