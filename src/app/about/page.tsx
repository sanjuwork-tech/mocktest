import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
export const metadata = pageMetadata(
  "Our purpose",
  "MockStride helps students discover more opportunities after Class 12 through clear exam information and official sources.",
  "/about",
);
export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">Why MockStride exists</p>
        <h1>
          Every student deserves
          <br />
          <em>to know their options.</em>
        </h1>
        <p className="hero-copy">
          A student’s ambition should never be limited by the exams they’ve
          heard about. We exist to bring more possibilities into view—and help
          students prepare for the ones they choose.
        </p>
      </section>
      <div className="page-shell reading-copy">
        <section>
          <h2>Our mission: widen the possibilities</h2>
          <p>
            Help students understand entrance exams after Class 12, the
            opportunities they open, and the steps needed to apply. We begin
            with CUET UG, IISER IAT, NEST and COMEDK UGET.
          </p>
        </section>
        <section>
          <h2>Our vision: a future chosen with confidence</h2>
          <p>
            A future where students choose a path with awareness and confidence,
            supported by clear information and purposeful preparation.
          </p>
        </section>
        <section>
          <h2>What you can use today</h2>
          <p>
            One exam guide with opportunities, eligibility summaries, exam
            formats, published dates and official links, alongside our
            mock-series catalog with planned inclusions and proposed prices.
            Enrolment is not yet open.
          </p>
          <Link href="/exams" className="text-link">
            Explore the exam guide →
          </Link>
        </section>
        <section id="information-policy">
          <h2>How we review information</h2>
          <p>
            We summarise official exam websites and bulletins, link to the
            source, and show when information was reviewed. Our notices are
            manually reviewed snapshots, not an automatic live feed.
          </p>
          <p>
            Dates and rules apply to the cycle shown. Later official notices
            take precedence. Where a source cannot be checked, we state that
            limitation. Confirm programme-specific eligibility, fees and
            deadlines with the organiser before acting.
          </p>
          <p>
            MockStride is independent of the exam authorities. We do not promise
            admission, rank, scholarships or career outcomes. Application and
            candidate-login links take you to the organiser’s website or its
            linked service provider.
          </p>
        </section>
        <section>
          <h2>Help us make it clearer</h2>
          <p>
            Found an outdated notice or an exam you want us to cover? Include
            the exam name and official source when you{" "}
            <a className="text-link" href="mailto:hello@mockstride.com">
              send a correction or suggestion
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
