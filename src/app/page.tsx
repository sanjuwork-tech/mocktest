import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  FileCheck2,
  GraduationCap,
  MoveUpRight,
} from "lucide-react";
import { exams } from "@/data/exams";
import { publicCatalog } from "@/server/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await publicCatalog();
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
            <Link href="/exams" className="button-primary">
              Explore your options <ArrowRight size={18} />
            </Link>
            <Link href="/test-series" className="text-link">
              Explore our mock tests <ArrowUpRight size={17} />
            </Link>
          </div>
          <p className="hero-footnote">
            CUET UG · IISER IAT · NEST · COMEDK UGET
          </p>
        </div>
        <div
          className="pathway-board"
          aria-label="Explore university, science and engineering pathways"
        >
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
              <span className="card-category">{product.shortName}</span>
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
                href={`/test-series#series-${product.slug}`}
                className="card-link"
              >
                View {product.shortName} series{" "}
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
      <section className="how-section">
        <div className="page-shell">
          <p className="eyebrow">A clearer way forward</p>
          <h2>
            From “what’s out there?”
            <br />
            to “what’s next?”
          </h2>
          <div className="how-grid">
            {[
              [
                Compass,
                "01",
                "Discover your options",
                "Explore exams by the subjects and opportunities that interest you.",
              ],
              [
                GraduationCap,
                "02",
                "Understand the opportunity",
                "Read about courses, eligibility and the admission route before choosing.",
              ],
              [
                FileCheck2,
                "03",
                "Take the next step",
                "Check official notices and follow the organiser’s application instructions.",
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
