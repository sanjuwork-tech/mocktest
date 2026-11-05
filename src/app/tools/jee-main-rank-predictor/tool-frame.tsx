import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/catalog";
import "./jee-predictors.css";

export type Faq = { q: string; a: string };

/** Shared frame for the JEE Main tools: breadcrumb, schema, hero, FAQ, disclaimer and related links. */
export function ToolFrame({
  path,
  name,
  title,
  summary,
  faqs,
  dateModified,
  children,
}: {
  path: string;
  name: string;
  title: ReactNode;
  summary: string;
  faqs: Faq[];
  dateModified: string;
  children: ReactNode;
}) {
  const url = `${siteConfig.url}${path}`;
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name,
              url,
              description: summary,
              dateModified,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              inLanguage: "en-IN",
              offers: { "@type": "Offer", price: 0, priceCurrency: "INR" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Free tools", item: `${siteConfig.url}/tools` },
                { "@type": "ListItem", position: 3, name, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }}
      />
      <section className="guide-hero page-shell">
        <nav aria-label="Breadcrumb" className="exam-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tools">Free tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{name}</span>
        </nav>
        <p className="eyebrow">Free tool · JEE Main</p>
        <h1>{title}</h1>
        <p className="hero-copy">{summary}</p>
        <p className="jeep-disclaimer">
          Estimates only. OurMocks is independent and not affiliated with NTA, JoSAA or CSAB. Always check official
          results and counselling notices.
        </p>
      </section>

      <div className="page-shell jeep-body">
        {children}

        <section className="exam-faqs jeep-section" aria-labelledby="jeep-faq">
          <h2 id="jeep-faq">Frequently asked questions</h2>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="jeep-section jeep-related" aria-labelledby="jeep-related">
          <h2 id="jeep-related">Also preparing for CUET, IISER IAT, NEST or COMEDK?</h2>
          <p>
            If JEE Main is one of several exams on your list, OurMocks has full-length mocks on each of these exams&apos;
            official patterns, and Test 1 of every exam is free.
          </p>
          <ul>
            <li><Link className="text-link" href="/exams/cuet-ug">CUET UG guide</Link></li>
            <li><Link className="text-link" href="/exams/iiser-iat">IISER IAT guide</Link></li>
            <li><Link className="text-link" href="/exams/niser-nest">NISER NEST guide</Link></li>
            <li><Link className="text-link" href="/exams/comedk">COMEDK UGET guide</Link></li>
            <li><Link className="text-link" href="/free-diagnostic">Free full-length mock tests</Link></li>
          </ul>
          <nav className="related-exam-links" aria-label="More JEE Main tools">
            <Link className="text-link" href="/tools/jee-main-rank-predictor">JEE Main rank predictor →</Link>
            <Link className="text-link" href="/tools/jee-main-college-predictor">JEE Main college predictor →</Link>
          </nav>
        </section>
        <p className="review-note">Last checked {dateModified}.</p>
      </div>
    </main>
  );
}
