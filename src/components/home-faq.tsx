import { JsonLd } from "@/components/json-ld";
import { blueprintFor } from "@/lib/blueprints/definitions";
import type { ExamSlug } from "@/lib/exams/catalog";

/** Ideal time per question (duration ÷ questions), read from the official blueprint. */
function pace(exam: ExamSlug) {
  const bp = blueprintFor(exam, "mathematics")!;
  const s = Math.round((bp.durationMinutes * 60) / bp.totalQuestions);
  if (s % 60 === 0) return `${s / 60} minute${s === 60 ? "" : "s"}`;
  return s < 120 ? `${s} seconds` : `${Math.floor(s / 60)} min ${s % 60} s`;
}

// Visible answers and FAQPage schema come from this one list, so they always match word for word.
export const HOME_FAQS = [
  {
    q: "Which exams can I practise, and is anything free?",
    a: "CUET UG, IISER IAT, NISER NEST and COMEDK UGET, each on its official pattern and marking. Test 1 is free for every exam we cover: CUET UG Test 1 is live now, and IAT, NEST and COMEDK Test 1 open as each paper is released.",
  },
  {
    q: "What analysis do I get after an OurMocks test?",
    a: "Your score under the official marking, accuracy, section and topic results, time spent on every question against the ideal pace, how you attempted each question (on pace, slow, rushed, skipped), whether changing answers helped you, the marks that were within reach, and a short list of personalised fixes for your next test.",
  },
  {
    q: "How does time-per-question analysis work?",
    a: `We record how long each question is on your screen while the tab is open. Each answer is compared with the ideal pace for that exam (${pace("cuet-ug")} in CUET UG, ${pace("iiser-iat")} in IAT, ${pace("niser-nest")} in NEST and ${pace("comedk")} in COMEDK), so you can see rushed mistakes, slow correct answers and questions that ate your time.`,
  },
  {
    q: "Is there an overall analysis across all my tests?",
    a: "Yes. The overall analysis tracks your score trend, the topics you have mastered and the ones costing you the most marks, your test-taking habits and a plan for the next test.",
  },
  {
    q: "Who checks the questions?",
    a: "Every mock test is reviewed by subject matter experts, PhD scholars and university professors before it is published, and each question comes with a worked solution.",
  },
  {
    q: "Is OurMocks run by NTA or the exam bodies?",
    a: "No. OurMocks is an independent practice platform. It is not affiliated with NTA, the IISERs, NISER, UM-DAE CEBS or COMEDK, and our tests are practice papers on the official pattern, not official papers. Always confirm rules and dates in the official bulletin.",
  },
];

export function HomeFaq() {
  return (
    <section className="exam-faqs home-faq" aria-labelledby="home-faq-title">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HOME_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <p className="eyebrow">Questions students ask</p>
      <h2 id="home-faq-title">About our tests and analysis</h2>
      {HOME_FAQS.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
