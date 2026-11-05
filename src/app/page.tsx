import { pageMetadata } from "@/lib/page-metadata";
import { ExpertReview } from "@/components/expert-review";
import { MockDemo } from "@/components/mock-demo";
import { ComparePlatforms } from "@/components/compare-platforms";
import { HomeFaq } from "@/components/home-faq";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, MoveUpRight } from "lucide-react";
import { PathwayDepth } from "@/components/motion/pathway-depth";
import { exams } from "@/data/exams";
import { freeTestHref, paymentsEnabled, products } from "@/data/catalog";
import "./home.css";

export const dynamic = "force-static";
// The root layout's title template does not apply to the root page, so the brand is added explicitly.
export const metadata = {
  ...pageMetadata(
    "Exams After Class 12 Beyond JEE & NEET",
    "Free Test 1 mock tests for CUET UG, IISER IAT, NEST and COMEDK with time-per-question analysis, plus exam guides, eligibility and colleges.",
    "/",
  ),
  title: { absolute: "OurMocks: Exams After Class 12 Beyond JEE & NEET" },
};

const PATHWAYS = [
  { name: "University life", copy: "Explore courses through CUET UG", href: "cuet-ug", tone: "blue" },
  { name: "A curious mind", copy: "Discover science through IAT & NEST", href: "iiser-iat", tone: "lime" },
  { name: "An engineering future", copy: "Explore Karnataka colleges with COMEDK", href: "comedk", tone: "coral" },
];

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
            OurMocks has full-length mock tests and plain-English guides for CUET UG, IISER IAT, NISER NEST and COMEDK
            UGET: four strong exams beyond JEE and NEET. Every test ends with a question-by-question look at where your
            time and marks went.
          </p>
          <div className="hero-actions">
            <Link href="/free-diagnostic" className="button-primary">
              Take free Test 1 <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/exams/after-class-12" className="text-link">
              Exams after Class 12 <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="home-status">
            <strong>Test 1 is free for every exam we cover.</strong> CUET UG is live now; IAT, NEST and COMEDK open as
            each paper is released.
          </p>
        </div>
        <div className="pathway-board" aria-label="Explore university, science and engineering pathways">
          <PathwayDepth />
          <div className="board-heading">
            <span className="eyebrow">Your future has options</span>
            <Compass size={25} aria-hidden="true" />
          </div>
          <p className="board-title">
            Find the path
            <br />
            that feels like <em>you.</em>
          </p>
          <div className="pathway-list">
            {PATHWAYS.map((item) => (
              <Link key={item.href} href={`/exams/${item.href}`} className={`pathway-row pathway-${item.tone}`}>
                <span>
                  <strong className="home-pathway-name">{item.name}</strong>
                  <span className="home-pathway-copy">{item.copy}</span>
                </span>
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

      <section className="page-shell section-space home-exams" aria-labelledby="home-exams-title">
        <div className="section-heading">
          <h2 id="home-exams-title">Four exams, one place to practise</h2>
          <Link href="/exams" className="text-link">
            All exam guides <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <ul className="home-exam-grid">
          {exams.map((exam) => {
            const pack = products.find((p) => p.slug === exam.slug);
            return (
              <li key={exam.slug} className={`home-exam-card theme-${exam.slug}`}>
                <span className="card-category">{exam.category}</span>
                <h3>{exam.name}</h3>
                <p>{exam.summary}</p>
                {pack && <p className="home-exam-meta">{pack.mocks} full-length tests planned · Test 1 free</p>}
                <div className="home-exam-links">
                  <Link href={pack ? freeTestHref(pack) : "/free-diagnostic"} className="card-link">
                    Take free Test 1
                    <span className="sr-only"> for {exam.name}</span> <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link href={`/exams/${exam.slug}`} className="text-link">
                    {exam.name} guide
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="review-note">
          Packs and bundles, with planned prices, are on the{" "}
          <Link href="/test-series" className="text-link">
            test series page
          </Link>
          . {paymentsEnabled() ? "Enrolment is open" : "Enrolment opens soon"}; Free Test 1 needs no payment.
        </p>
      </section>

      <div className="page-shell section-space">
        <MockDemo />
      </div>
      <div className="page-shell">
        <ExpertReview />
      </div>
      <div className="page-shell section-space">
        <ComparePlatforms />
      </div>
      <div className="page-shell">
        <HomeFaq />
      </div>
      <section className="page-shell section-space">
        <div className="closing-panel">
          <div>
            <h2>
              Start with one full paper.
              <br />
              See where you stand.
            </h2>
            <p>Not sure which exam yet? Read the exams after Class 12 guide first.</p>
          </div>
          <div className="home-closing-actions">
            <Link className="button-primary" href="/free-diagnostic">
              Take free Test 1 <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="text-link" href="/exams/after-class-12">
              Exams after Class 12
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
