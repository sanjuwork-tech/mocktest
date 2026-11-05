import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpenCheck, Focus, Route } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { CatalogGrid } from "@/components/catalog-grid";
import { paymentsEnabled, products, siteConfig } from "@/data/catalog";
import { JsonLd } from "@/components/json-ld";
import { WaitlistForm } from "@/components/waitlist-form";
import "./test-series.css";

export const metadata = pageMetadata(
  "Mock test series for CUET, IAT, NEST & COMEDK",
  "Full-length mock test series for CUET UG, IISER IAT, NEST and COMEDK UGET for 2027: test counts, what you get, planned prices and a free Test 1 for every exam we cover.",
  "/test-series",
  [
    "mock test series 2027",
    "CUET UG mock tests",
    "IISER IAT test series",
    "NEST mock tests",
    "COMEDK practice tests",
  ],
);
export default function TestSeriesPage() {
  const open = paymentsEnabled();
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "OurMocks Test Series",
          description:
            "Explore mock test series for CUET UG, IISER IAT, NEST and COMEDK UGET.",
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.title,
            url: `${siteConfig.url}/test-series/${product.slug}`,
          })),
        }}
      />
      <section className="guide-hero page-shell preparation-hero">
        <p className="eyebrow">Mock tests for the path you choose</p>
        <h1>
          Your dream is specific.
          <br />
          <em>Your practice should be, too.</em>
        </h1>
        <p className="hero-copy">
          A future in science. A university that feels right. An engineering
          branch you can&apos;t stop thinking about. Explore our mock test series for
          CUET UG, IISER IAT, NEST and COMEDK UGET.
        </p>
        <div className="hero-actions">
          <a href="#mock-series" className="button-primary">
            Compare mock series <ArrowRight size={18} />
          </a>
          <Link href="/exams" className="text-link">
            Still choosing your exam? Explore your options ↗
          </Link>
        </div>
      </section>
      <section
        className="preparation-promise page-shell"
        aria-labelledby="preparation-promise-title"
      >
        <div>
          <p className="eyebrow">Focused preparation. More possibilities.</p>
          <h2 id="preparation-promise-title">
            The exam you choose
            <br />
            deserves serious preparation.
          </h2>
        </div>
        <p>
          JEE and NEET are important paths. They aren&apos;t the whole map. Our focus
          is on helping you discover and prepare for the university, science and
          engineering opportunities these four exams can open.
        </p>
      </section>
      <section
        id="mock-series"
        aria-labelledby="mock-series-title"
        className="page-shell section-space"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Our mock test series</p>
            <h2 id="mock-series-title">
              Choose your exam.
              <br />
              See what&apos;s in your series.
            </h2>
          </div>
        </div>
        <div className="pricing-note">
          <strong>2027 admission cycle · {open ? "Enrolment open" : "Enrolment opens soon"}</strong>
          <p>
            Every series is made of full-length mocks on its exam&apos;s official
            pattern and marking, taken on an NTA-style test screen, with worked
            solutions and analysis of time, sections, topics and difficulty after
            each test. {open ? "" : "Paid enrolment has not opened yet: prices shown are planned, and access details are confirmed when enrolment opens."}
          </p>
        </div>
        <div className="ts-free-banner">
          <div>
            <strong>Test 1 is free for every exam we cover and every CUET subject</strong>
            <p>
              Take a full-length Test 1 on the real pattern and timing, then see
              your analysis. Where a Test 1 isn&apos;t open yet, you can ask to be
              notified.
            </p>
          </div>
          <Link href="/free-diagnostic" className="button-primary">
            Take free Test 1 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <CatalogGrid products={products} />

        {!open && (
          <WaitlistForm
          defaultExam="all-access"
          headline="Get told when enrolment opens"
          subheadline="Paid enrolment opens once payments are set up. Leave your email and we'll tell you when it opens for your exam."
            source="test_series_page"
          />
        )}

        <p className="ts-legal-note">
          Read our{" "}
          <Link href="/refund-policy" className="text-link">
            refund and cancellation policy
          </Link>{" "}
          before you enrol.
        </p>
        <nav className="related-exam-links ts-related" aria-label="Individual series pages">
          {products.map((product) => (
            <Link
              key={product.slug}
              className="text-link"
              href={`/test-series/${product.slug}`}
            >
              {product.shortName} series details <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      </section>
      <section className="how-section">
        <div className="page-shell">
          <p className="eyebrow">Built around your next attempt</p>
          <h2>
            Every mock should move
            <br />
            your preparation forward.
          </h2>
          <div className="how-grid">
            {[
              {
                Icon: Focus,
                number: "01",
                title: "Practise for your exam",
                copy: "Each mock follows the official pattern, timing and marking of the exam you're preparing for.",
              },
              {
                Icon: BookOpenCheck,
                number: "02",
                title: "Understand your mistakes",
                copy: "Worked solutions for every question, plus time, section, topic and difficulty analysis after each test.",
              },
              {
                Icon: Route,
                number: "03",
                title: "Find your next step",
                copy: "Use each attempt to decide what needs revision and where to focus your practice next.",
              },
            ].map(({ Icon, number, title, copy }) => (
              <article key={number}>
                <div className="step-top">
                  <Icon size={26} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-shell section-space">
        <div className="closing-panel">
          <div>
            <p className="eyebrow">A different path is still your path</p>
            <h2>
              Dream beyond the familiar.
              <br />
              Prepare for what matters to you.
            </h2>
          </div>
          <a href="#mock-series" className="button-primary">
            Find your mock series <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
