import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { reviewIsStale, type OfficialLink, type ExamGuide } from "@/data/exams";

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
          <h2 id={`${exam.slug}-title`}>{exam.name}</h2>
          <p>{exam.fullName}</p>
        </div>
      </header>
      <div className="exam-guide-body">
        <p className="guide-summary">{exam.summary}</p>
        {!standalone && (
          <Link className="text-link mb-5" href={`/exams/${exam.slug}`}>
            Open the complete {exam.name} guide{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        )}
        <div className="opportunity-box">
          <h3>The opportunity</h3>
          <p>{exam.opportunity}</p>
          <p className="mt-3">{exam.programmes}</p>
        </div>
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
            <h3>Exam format & syllabus</h3>
            <p>{exam.format}</p>
            <p className="mt-3">{exam.syllabus}</p>
          </section>
          <section>
            <h3>Application fees</h3>
            <p>{exam.fee}</p>
          </section>
          <section>
            <h3>After your result</h3>
            <p>{exam.admission}</p>
          </section>
        </div>
        <section className="date-panel">
          <h3>Important dates · 2026</h3>
          <dl>
            {exam.dates.map((date) => (
              <div key={date.label}>
                <dt>{date.label}</dt>
                <dd>{date.value}</dd>
              </div>
            ))}
          </dl>
          <p className="review-note">
            Historical dates and published schedules. Later official notices
            take precedence.
          </p>
        </section>
        <section className="application-panel">
          <span className="status-pill">
            {exam.application.status === "closed"
              ? "2026 applications closed"
              : "Current portal status unverified"}
          </span>
          <h3>Official application & candidate access</h3>
          <p>{exam.application.note}</p>
          <OfficialAnchor link={exam.application} className="button-primary" />
          <span className="destination-domain">
            Destination: {new URL(exam.application.url).hostname}
          </span>
        </section>
        <section className="source-panel">
          <h3>Go deeper with official sources</h3>
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
            Reviewed {exam.checkedOn}.{" "}
            {exam.verification === "partial"
              ? "IAT details are based on indexed official bulletin material; the live admissions portal could not be reached."
              : "Summarised from the linked official sources."}{" "}
            {reviewIsStale(exam.checkedOn, now) &&
              "This review is more than seven days old. Check official notices before acting."}
          </p>
        </section>
      </div>
    </article>
  );
}
