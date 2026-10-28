import { BadgeCheck, FileCheck2, GraduationCap, PenLine } from "lucide-react";

const STEPS = [
  { icon: PenLine, title: "Written to the official pattern", text: "Every paper follows the latest official question count, sections, timing and marking for its exam." },
  { icon: BadgeCheck, title: "Reviewed by subject matter experts", text: "Each question, its options and its answer are checked by an expert in that subject." },
  { icon: GraduationCap, title: "Checked by PhD scholars and university professors", text: "A second academic review covers accuracy, difficulty and the worked solution." },
  { icon: FileCheck2, title: "Published with a full solution", text: "Only reviewed questions reach a test, each with a step-by-step explanation." },
];

/** How questions are reviewed before students see them; shown on the home and About pages. */
export function ExpertReview({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className="expert-review" aria-labelledby="expert-review-title">
      <div className="expert-review-intro">
        <p className="eyebrow">Reviewed before you see it</p>
        <Heading id="expert-review-title">
          Every mock test is reviewed by subject matter experts, PhD scholars and university professors.
        </Heading>
        <p>
          For students, that means questions you can trust. For parents, it means practice time isn&apos;t wasted on errors.
        </p>
      </div>
      <ol className="expert-steps">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <span className="expert-step-number">{i + 1}</span>
            <Icon size={22} aria-hidden="true" />
            <strong>{title}</strong>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
