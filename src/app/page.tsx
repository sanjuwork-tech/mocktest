import { pageMetadata } from "@/lib/page-metadata";
import { ExpertReview } from "@/components/expert-review";
import { MockDemo } from "@/components/mock-demo";
import { ComparePlatforms } from "@/components/compare-platforms";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  FileCheck2,
  GraduationCap,
  MoveUpRight,
  Play,
  BarChart3,
} from "lucide-react";
import { PathwayDepth } from "@/components/motion/pathway-depth";
import { exams } from "@/data/exams";
import { products } from "@/data/catalog";

export const dynamic = "force-static";
// The root layout's title template does not apply to the root page, so the brand is added explicitly.
export const metadata = {
  ...pageMetadata(
    "Exams After Class 12 Beyond JEE & NEET",
    "Guides to CUET UG, IISER IAT, NISER NEST and COMEDK UGET — official patterns, eligibility and colleges — plus free full-length CUET mock tests.",
    "/",
  ),
  title: { absolute: "OurMocks: Exams After Class 12 Beyond JEE & NEET" },
};

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="home-hero page-shell">
        <div>
          <p className="eyebrow">For your next chapter</p>
          <h1>
            Your dream deserves
            <br />
            <em>more than one path.</em>
          </h1>
          <p className="hero-copy">
            JEE Main, JEE Advanced and NEET are important paths—but your
            possibilities don’t end there. Discover CUET, IAT, NEST and COMEDK,
            then find focused practice for the future you choose.
          </p>
          <div className="hero-actions">
            <Link href="/free-diagnostic" className="button-primary">
              Attempt Free Mock Test <ArrowRight size={18} />
            </Link>
            <Link href="/exams" className="text-link">
              Explore your options <ArrowUpRight size={17} />
            </Link>
          </div>
          <div
            style={{
              marginTop: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "999px",
              padding: "6px 14px",
              fontSize: "12px",
              color: "#166534",
              fontWeight: 500,
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            <span><strong>CUET UG:</strong> free full-length Test 1 in 12 subjects · <strong>IAT, NEST &amp; COMEDK:</strong> mocks in preparation</span>
          </div>
        </div>
        <div
          className="pathway-board"
          aria-label="Explore university, science and engineering pathways"
        >
          <PathwayDepth />
          <div className="board-heading">
            <span className="eyebrow">Your future has options</span>
            <Compass size={25} />
          </div>
          <p className="board-title">
            Find the path
            <br />
            that feels like <em>you.</em>
          </p>
          <div className="pathway-list">
            {[
              {
                name: "University life",
                copy: "Explore courses through CUET UG",
                href: "cuet-ug",
                tone: "blue",
              },
              {
                name: "A curious mind",
                copy: "Discover science through IAT & NEST",
                href: "iiser-iat",
                tone: "lime",
              },
              {
                name: "An engineering future",
                copy: "Explore Karnataka colleges with COMEDK",
                href: "comedk",
                tone: "coral",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={`/exams#${item.href}`}
                className={`pathway-row pathway-${item.tone}`}
              >
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.copy}</p>
                </div>
                <MoveUpRight size={20} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <div className="board-footer">
            <span className="step-dots">
              <i />
              <i />
              <i />
            </span>
            <span>Discover. Understand. Decide.</span>
          </div>
        </div>
      </section>
      <div className="page-shell section-space">
        <ExpertReview />
      </div>
      <div className="page-shell section-space">
        <MockDemo />
      </div>
      <section
        id="home-mock-series"
        className="page-shell home-mock-section"
        aria-labelledby="home-mock-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Our mock tests, at a glance</p>
            <h2 id="home-mock-title">
              A path worth choosing.
              <br />
              Practice worth making time for.
            </h2>
          </div>
          <Link href="/test-series#mock-series" className="text-link">
            Compare every series <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <p className="section-copy">
          Focused mock series for CUET UG, IISER IAT, NEST and COMEDK. Find your
          exam, see the proposed price, and explore what we’re planning for your
          preparation.
        </p>
        <div className="home-mock-grid">
          {products.map((product) => (
            <article
              key={product.slug}
              className={`home-mock-card theme-${product.slug}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="card-category">{product.shortName}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: product.slug === "cuet-ug" ? "#dcfce7" : "#fef3c7",
                    color: product.slug === "cuet-ug" ? "#15803d" : "#92400e",
                  }}
                >
                  {product.slug === "cuet-ug" ? "Test 1 free" : "In preparation"}
                </span>
              </div>
              <h3>{product.mocks} planned mocks</h3>
              <p className="home-mock-pattern">{product.pattern}</p>
              <ul>
                {product.features.slice(1, 3).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="home-mock-price">
                <span>Proposed price</span>
                <strong>₹{product.price.toLocaleString("en-IN")}</strong>
              </div>
              <Link
                href={
                  product.slug === "cuet-ug"
                    ? "/free-diagnostic"
                    : product.isBundle
                      ? "/test-series#waitlist"
                      : `/free-diagnostic?exam=${product.includedExams?.[0] ?? product.slug}#waitlist`
                }
                className="card-link"
              >
                {product.slug === "cuet-ug" ? "Attempt Free Test" : "Notify Me on Launch"}{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <p className="review-note">
          Planned offering · Prices, inclusions, test counts and access dates
          are subject to confirmation. Enrolment is not yet open.
        </p>
      </section>
      <section className="mission-strip">
        <div className="page-shell">
          <p>
            Your ambition deserves
            <br />
            <strong>a bigger map.</strong>
          </p>
          <span>
            Discover the opportunity. Understand the exam.
            <br />
            Prepare for the path that feels right to you.
          </span>
        </div>
      </section>
      <section className="page-shell section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Four places to begin</p>
            <h2>
              Different exams.
              <br />
              Different possibilities.
            </h2>
          </div>
          <Link href="/exams" className="text-link">
            See every guide <ArrowRight size={17} />
          </Link>
        </div>
        <div className="directory-grid">
          {exams.map((exam) => (
            <Link
              key={exam.slug}
              href={`/exams#${exam.slug}`}
              className={`directory-card theme-${exam.slug}`}
            >
              <span className="card-category">{exam.category}</span>
              <h3>{exam.name}</h3>
              <p>{exam.summary}</p>
              <span className="card-link">
                Explore this exam <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <div className="page-shell section-space">
        <ComparePlatforms />
      </div>
      <section className="how-section">
        <div className="page-shell">
          <p className="eyebrow">A clearer way forward</p>
          <h2>
            How OurMocks helps you
            <br />
            prepare with clarity.
          </h2>
          <div className="how-grid">
            {[
              [
                Play,
                "01",
                "Take a Free Full-Length Test",
                "Attempt an official 50-question CUET mock test with real NTA CBT timing and instant scoring.",
              ],
              [
                BarChart3,
                "02",
                "Understand Your Mistakes & Pace",
                "Identify questions where you spent too long, spot high-confidence mistakes, and see topic mastery.",
              ],
              [
                GraduationCap,
                "03",
                "Follow a Focused Practice Plan",
                "Turn diagnostics into targeted revision, build stamina, and prepare for your target exam cycle.",
              ],
            ].map(([Icon, number, title, copy]) => {
              const StepIcon = Icon as typeof Compass;
              return (
                <article key={String(number)}>
                  <div className="step-top">
                    <StepIcon size={26} />
                    <span>{String(number)}</span>
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(copy)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="page-shell section-space">
        <div className="closing-panel">
          <div>
            <p className="eyebrow">Your ambition. More possibilities.</p>
            <h2>
              One exam is a milestone.
              <br />
              Your future is bigger.
            </h2>
            <p>Explore what excites you. Prepare for what comes next.</p>
          </div>
          <Link className="button-primary" href="/exams">
            Find your next step <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
