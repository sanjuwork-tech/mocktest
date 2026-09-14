import Link from "next/link";
import { ArrowRight, BookOpenCheck, Focus, Route } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { CatalogGrid } from "@/components/catalog-grid";
import { publicCatalog } from "@/server/products";
export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "Mock test series for CUET, IAT, NEST & COMEDK",
  "Explore our planned exam-focused mock series, test counts, inclusions and proposed pricing for CUET UG, IISER IAT, NEST and COMEDK UGET.",
  "/test-series",
);
export default async function TestSeriesPage() {
  const products = await publicCatalog();
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell preparation-hero">
        <p className="eyebrow">Mock tests for the path you choose</p>
        <h1>
          Your dream is specific.
          <br />
          <em>Your practice should be, too.</em>
        </h1>
        <p className="hero-copy">
          A future in science. A university that feels right. An engineering
          branch you can’t stop thinking about. Explore our mock test series for
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
          JEE and NEET are important paths. They aren’t the whole map. Our focus
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
              See what’s in your series.
            </h2>
          </div>
        </div>
        <div className="pricing-note">
          <strong>Proposed pricing · Enrolment not yet open</strong>
          <p>
            The prices and inclusions below describe our planned offering. Final
            prices, exam cycle and access dates will be confirmed before
            purchase. You can contact us about any series.
          </p>
        </div>
        <CatalogGrid products={products} />
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
                copy: "Our series plans start with the subjects, question style and timing of the exam you’re preparing for.",
              },
              {
                Icon: BookOpenCheck,
                number: "02",
                title: "Understand your mistakes",
                copy: "Clear solutions and exam-specific feedback are central to our planned preparation experience.",
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
