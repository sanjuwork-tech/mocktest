import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { ExpertReview } from "@/components/expert-review";
import { siteConfig } from "@/data/catalog";
import { GRIEVANCE_ROLE } from "../privacy/legal";
import "../privacy/legal.css";
export const metadata = pageMetadata(
  "Our purpose",
  "OurMocks helps students discover more opportunities after Class 12 through clear exam information and official sources.",
  "/about",
);
export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">Why OurMocks exists</p>
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
          <h2>How our mock tests are made</h2>
          <ExpertReview headingLevel={3} />
        </section>
        <section>
          <h2>What you can use today</h2>
          <p>
            Exam guides for CUET UG, IISER IAT, NEST and COMEDK UGET with official patterns, eligibility, syllabus,
            past papers and a score calculator; and free full-length CUET UG mock tests with a section and topic
            report. Paid test series are not yet open for enrolment.
          </p>
          <Link href="/exams" className="text-link">
            Explore the exam guides →
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
            OurMocks is independent of the exam authorities. We do not promise
            admission, rank, scholarships or career outcomes. Application and
            candidate-login links take you to the organiser’s website or its
            linked service provider.
          </p>
        </section>
        <section id="grievance" className="legal-copy" aria-labelledby="grievance-title">
          {/* DPDP Act 2023 s.8(9), s.8(10), s.13; DPDP Rules 2025 rules 9 and 14(3) (90-day ceiling); IT Rules 2021
              rule 3(2) (24 h / 7 days) followed as good practice. Sources in src/app/privacy/legal.ts. */}
          <h2 id="grievance-title">Questions, complaints and grievances</h2>
          <p>
            If something is wrong — a question with a wrong answer, a problem with your account, a payment, or how
            we handle your personal data — please tell us. Students and parents can both write to us.
          </p>
          <div className="legal-callout">
            <p>
              <strong>{GRIEVANCE_ROLE}</strong>
              <br />
              Email: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </p>
            <p>
              This officer answers questions about how OurMocks processes personal data and handles complaints.
            </p>
          </div>
          <h3>How to raise a complaint</h3>
          <ol>
            <li>Email us from the address on your account (parents: from the email given at sign-up), with “Grievance” in the subject.</li>
            <li>Tell us what happened, when, and what you would like us to do. For a test question, give the test name and question number.</li>
            <li>We may ask a question to confirm it is you before we share or change any account data.</li>
          </ol>
          <h3>How quickly we respond</h3>
          <ul>
            <li>We acknowledge every complaint within 24 hours.</li>
            <li>We aim to resolve it within 7 days, and tell you the outcome and our reasons.</li>
            <li>Requests to see, correct or delete personal data, and complaints about personal data, are always settled within 90 days at most, the limit set by rule 14(3) of the DPDP Rules, 2025.</li>
          </ul>
          <h3>If you are not satisfied</h3>
          <p>
            For complaints about personal data, you can go to the Data Protection Board of India after you have
            first raised the complaint with us (section 13(3) of the Digital Personal Data Protection Act, 2023).
            The Board is designed to take complaints online through its own portal; check the{" "}
            <a href="https://www.meity.gov.in/" rel="noopener noreferrer" target="_blank">
              Ministry of Electronics and IT website
            </a>{" "}
            for how to reach it. Appeals against the Board’s decisions go to the Telecom Disputes Settlement
            and Appellate Tribunal. For other complaints, you keep any rights you have under Indian consumer law.
          </p>
          <p>
            How to use your data rights is explained in our{" "}
            <Link href="/privacy#rights" className="text-link">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
