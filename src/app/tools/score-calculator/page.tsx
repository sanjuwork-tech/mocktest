import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { ScoreCalculator } from "@/components/score-calculator";
import { siteConfig } from "@/data/catalog";

export const metadata = pageMetadata(
  "CUET, IAT, NEST & COMEDK Score Calculator",
  "Work out your CUET UG, IISER IAT, NEST or COMEDK score from your correct and wrong answers, using each exam's official marking scheme.",
  "/tools/score-calculator",
);

const FAQS = [
  { q: "How is the CUET UG score calculated?", a: "Each correct answer earns 5 marks and each wrong answer loses 1; unanswered questions score 0. A 50-question paper is out of 250. NTA then normalises papers held in several shifts." },
  { q: "How is the IAT score calculated?", a: "IAT has 60 questions, 15 per subject, marked +4 for correct and −1 for wrong, for a maximum of 240." },
  { q: "How is the NEST score calculated?", a: "Each of the four 20-question sections is marked +3/−1 (60 marks each). Your total is the sum of your best three sections, out of 180, and each counted section must clear its minimum admissible score." },
  { q: "How is the COMEDK score calculated?", a: "COMEDK has 180 questions, one mark each, with no negative marking, so your score equals your number of correct answers." },
];

export default async function ScoreCalculatorPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const { exam } = await searchParams;
  const url = `${siteConfig.url}/tools/score-calculator`;
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Entrance exam score calculator",
              url,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: 0, priceCurrency: "INR" },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }}
      />
      <section className="guide-hero page-shell">
        <p className="eyebrow">Free tool</p>
        <h1>
          Exam score
          <br />
          <em>calculator.</em>
        </h1>
        <p className="hero-copy">
          Enter how many questions you got right and wrong — from a mock, a past paper or the official answer key — and see
          your score under the official marking scheme.
        </p>
      </section>
      <div className="page-shell section-space">
        <ScoreCalculator initialExam={exam} />

        <section className="exam-faqs section-space" aria-labelledby="calc-faq">
          <h2 id="calc-faq">How each exam is marked</h2>
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
        <p className="review-note">
          Marking schemes from the official 2026 bulletins. See the{" "}
          <Link href="/exams/cuet-ug">CUET</Link>, <Link href="/exams/iiser-iat">IAT</Link>,{" "}
          <Link href="/exams/niser-nest">NEST</Link> and <Link href="/exams/comedk">COMEDK</Link> guides for sources.
        </p>
      </div>
    </main>
  );
}
