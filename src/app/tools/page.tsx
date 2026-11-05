import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/catalog";
import "./tools.css";

const PATH = "/tools";

export const metadata = pageMetadata(
  "Free Exam Tools: Score, Eligibility, Predictors",
  "Free tools for Class 12 students: exam score calculator, eligibility checker, and JEE Main and NEET rank and college predictors built on official data.",
  PATH,
);

// Shared with the header and footer through the URLs only; keep these paths in step with src/app/tools/*.
const GROUPS = [
  {
    id: "tools-four-exams",
    title: "For CUET UG, IISER IAT, NISER NEST and COMEDK",
    tools: [
      {
        href: "/tools/score-calculator",
        name: "Score calculator",
        line: "Your score from right and wrong answers, under each exam's official marking.",
      },
      {
        href: "/exams/eligibility",
        name: "Eligibility checker",
        line: "Check your Class 12 marks, subjects and passing year against all four exams at once.",
      },
    ],
  },
  {
    id: "tools-jee-neet",
    title: "For JEE Main and NEET UG",
    tools: [
      {
        href: "/tools/jee-main-rank-predictor",
        name: "JEE Main rank predictor",
        line: "An estimated rank range for your JEE Main percentile, with the method shown.",
      },
      {
        href: "/tools/jee-main-college-predictor",
        name: "JEE Main college predictor",
        line: "Colleges whose recent closing ranks are near your estimated rank.",
      },
      {
        href: "/tools/neet-rank-predictor",
        name: "NEET rank predictor",
        line: "An estimated All India Rank range from your NEET marks, using NTA's published figures.",
      },
      {
        href: "/tools/neet-college-predictor",
        name: "NEET college predictor",
        line: "Medical colleges whose recent closing ranks are near your estimated rank.",
      },
    ],
  },
];

export default function ToolsPage() {
  const url = `${siteConfig.url}${PATH}`;
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${url}#page`,
              name: "Free tools for Class 12 students",
              url,
              isPartOf: { "@id": `${siteConfig.url}/#website` },
              breadcrumb: { "@id": `${url}#breadcrumb` },
              hasPart: GROUPS.flatMap((g) =>
                g.tools.map((t) => ({ "@type": "WebPage", name: t.name, url: `${siteConfig.url}${t.href}` })),
              ),
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Free tools", item: url },
              ],
            },
          ],
        }}
      />
      <section className="guide-hero page-shell">
        <nav aria-label="Breadcrumb" className="exam-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Free tools</span>
        </nav>
        <p className="eyebrow">Free tools</p>
        <h1>
          Plan with numbers,
          <br />
          <em>not guesses.</em>
        </h1>
        <p className="hero-copy">
          Six free tools for Class 12 students: work out a score, check your eligibility, or estimate a JEE Main or
          NEET rank and the colleges near it.
        </p>
      </section>

      <div className="page-shell tools-body">
        {GROUPS.map((group) => (
          <section key={group.id} className="tools-group" aria-labelledby={group.id}>
            <h2 id={group.id}>{group.title}</h2>
            <ul className="tools-list">
              {group.tools.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="tools-card">
                    <span className="tools-name">
                      {tool.name} <ArrowRight size={18} aria-hidden="true" />
                    </span>
                    <span className="tools-line">{tool.line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="review-note">
          Predictors are estimates from previous years&apos; official data, not official results. Your actual rank and
          seat depend on the exam year, your category and counselling.
        </p>

        <section className="exam-cta-band tools-cta">
          <div>
            <h2>See where you stand on a real paper.</h2>
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
