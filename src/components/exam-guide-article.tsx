import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  formatReviewDate,
  reviewIsStale,
  type OfficialLink,
  type ExamGuide,
} from "@/data/exams";

export function OfficialAnchor({
  link,
  className = "",
}: {
  link: OfficialLink;
  className?: string;
}) {
  return (
    <a
      href={link.url}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {link.label}
      <ArrowUpRight size={16} aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Visible FAQ list; pages that render it emit the matching FAQPage schema. */
export function ExamFaqs({ exam }: { exam: ExamGuide }) {
  return (
    <section className="exam-faqs" aria-labelledby={`${exam.slug}-faq-title`}>
      <h3 id={`${exam.slug}-faq-title`}>{exam.name}: frequently asked questions</h3>
      {exam.faqs.map((faq) => (
        <details key={faq.q}>
          <summary>{faq.q}</summary>
          <p>{faq.a}</p>
        </details>
      ))}
    </section>
  );
}

export function ExamGuideArticle({
  exam,
  index,
  now,
  standalone = false,
}: {
  exam: ExamGuide;
  index: number;
  now: Date;
  standalone?: boolean;
}) {
  return (
    <article
      id={exam.slug}
      className={`exam-guide theme-${exam.slug}`}
      aria-labelledby={`${exam.slug}-title`}
    >
      <header className="exam-guide-header">
        <span className="guide-number">0{index + 1}</span>
        <div>
          <p className="eyebrow">{exam.category}</p>
          <h2 id={`${exam.slug}-title`}>What is {exam.name}?</h2>
          <p>{exam.fullName}</p>
        </div>
      </header>
      <div className="exam-guide-body">
        <p className="guide-answer">{exam.quickAnswer}</p>
        {!standalone && (
          <Link className="text-link mb-5" href={`/exams/${exam.slug}`}>
            Read the complete {exam.name} guide{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        )}

        <section className="pattern-panel" aria-labelledby={`${exam.slug}-pattern`}>
          <h3 id={`${exam.slug}-pattern`}>{exam.name} exam pattern (2026 official)</h3>
          <table className="pattern-table">
            <tbody>
              {exam.pattern.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {exam.seats && <p className="mt-3">{exam.seats}</p>}
        </section>

        <section className="next-cycle-panel" aria-labelledby={`${exam.slug}-next`}>
          <h3 id={`${exam.slug}-next`}>{exam.nextCycle.title}</h3>
          <ul>
            {exam.nextCycle.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="opportunity-box" aria-labelledby={`${exam.slug}-accepted`}>
          <h3 id={`${exam.slug}-accepted`}>Where {exam.name} can take you</h3>
          <ul className="accepted-list">
            {exam.acceptedBy.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong> — {item.detail}
              </li>
            ))}
          </ul>
          <p className="mt-3">{exam.opportunity}</p>
        </section>

        <div className="guide-facts">
          <section>
            <h3>Who can apply?</h3>
            <ul>
              {exam.eligibility.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Syllabus</h3>
            <p>{exam.syllabus}</p>
          </section>
          <section>
            <h3>Application fees (2026)</h3>
            <p>{exam.fee}</p>
          </section>
          <section>
            <h3>After your result</h3>
            <p>{exam.admission}</p>
          </section>
        </div>
        <section className="date-panel">
          <h3>2026 dates, for reference</h3>
          <dl>
            {exam.dates.map((date) => (
              <div key={date.label}>
                <dt>{date.label}</dt>
                <dd>{date.value}</dd>
              </div>
            ))}
          </dl>
          <p className="review-note">
            These are last cycle&apos;s dates. The next cycle&apos;s official notice takes precedence.
          </p>
        </section>
        <section className="application-panel">
          <span className="status-pill">2026 applications closed</span>
          <h3>Official website & candidate login</h3>
          <p>{exam.application.note}</p>
          <OfficialAnchor link={exam.application} className="button-primary" />
          <span className="destination-domain">
            Destination: {new URL(exam.application.url).hostname}
          </span>
        </section>
        {standalone && <ExamFaqs exam={exam} />}
        <section className="source-panel">
          <h3>Official sources</h3>
          <div>
            {exam.sources.map((source) => (
              <OfficialAnchor
                key={source.url}
                link={source}
                className="text-link"
              />
            ))}
          </div>
          <p className="review-note">
            Last verified against these sources on{" "}
            <time dateTime={exam.checkedOn}>{formatReviewDate(exam.checkedOn)}</time>.{" "}
            {reviewIsStale(exam.checkedOn, now) &&
              "Check the official website for notices published since then."}
          </p>
        </section>
      </div>
    </article>
  );
}
