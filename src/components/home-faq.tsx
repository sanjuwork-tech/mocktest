import { JsonLd } from "@/components/json-ld";

export const HOME_FAQS = [
  {
    q: "What analysis do I get after an OurMocks test?",
    a: "Your score under the official marking, accuracy, section and topic results, time spent on every question against the ideal pace, how you attempted each question (on pace, slow, rushed, skipped), whether changing answers helped you, the marks that were within reach, and a short list of personalised fixes for your next test.",
  },
  {
    q: "How does time-per-question analysis work?",
    a: "We record how long each question is on your screen while the tab is open. Each answer is compared with the ideal pace for that exam — 72 seconds in CUET UG, 3 minutes in IAT, 2 min 15 s in NEST and 1 minute in COMEDK — so you can see rushed mistakes, slow correct answers and questions that ate your time.",
  },
  {
    q: "Is there an overall analysis across all my tests?",
    a: "Yes. The overall analysis tracks your score trend, the topics you have mastered and the ones costing you the most marks, your test-taking habits and a plan for the next test.",
  },
  {
    q: "Which exams can I practise, and is anything free?",
    a: "CUET UG, IISER IAT, NISER NEST and COMEDK UGET, each on its official pattern and marking. Test 1 is free.",
  },
  {
    q: "Who checks the questions?",
    a: "Every mock test is reviewed by subject matter experts, PhD scholars and university professors before it is published, and each question comes with a worked solution.",
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
