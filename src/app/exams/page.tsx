import { pageMetadata } from "@/lib/page-metadata";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { ExamDirectory } from "@/components/exam-directory";
import { exams, reviewIsStale, type OfficialLink } from "@/data/exams";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Exams after Class 12 — CUET, IAT, NEST & COMEDK",
  "Explore four entrance exams in one place: opportunities, eligibility, dates, official notifications and candidate links.",
  "/exams",
);

function OfficialAnchor({
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

export default function ExamsPage() {
  const now = new Date();
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">The exam discovery guide</p>
        <h1>
          There’s a world beyond
          <br />
          <em>the familiar exams.</em>
        </h1>
        <p className="hero-copy">
          Your interests deserve to lead the way. Explore science, engineering
          and university opportunities after Class 12—with the exam details and
          official updates you need, together in one place.
        </p>
        <div className="hero-tags">
          <span>
            <CheckCircle2 size={16} /> Official sources linked
          </span>
          <span>
            <BookOpen size={16} /> Four exam guides, one page
          </span>
          <span>
            <CalendarDays size={16} /> 2026 reference cycle
          </span>
        </div>
      </section>
      <div className="page-shell">
        <ExamDirectory />
      </div>
      <section
        id="notifications"
        className="page-shell section-space"
        aria-labelledby="notifications-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Know your next step</p>
            <h2 id="notifications-title">Official notices, in context.</h2>
          </div>
          <a href="#exam-details" className="text-link">
            Go to exam details ↓
          </a>
        </div>
        <p className="section-copy">
          These are reviewed summaries, not a live feed. Review dates are shown
          for each exam. The 2026 information below must not be treated as a
          2027 schedule.
        </p>
        <div className="notice-grid">
          {exams.map((exam) => (
            <article key={exam.slug} className="notice-card">
              <span className="eyebrow">{exam.name}</span>
              <h3>{exam.notification.title}</h3>
              <p>{exam.notification.detail}</p>
              <OfficialAnchor
                link={exam.notification.source}
                className="text-link"
              />
              <p className="review-note">
                Review attempted {exam.checkedOn}
                {exam.verification === "partial"
                  ? " · Live portal unverified"
                  : " · Official source reviewed"}
                {reviewIsStale(exam.checkedOn, now)
                  ? " · Recheck the official site for newer notices"
                  : ""}
              </p>
            </article>
          ))}
        </div>
      </section>
      <div className="exam-reading-area" id="exam-details">
        <div className="page-shell reading-layout">
          <aside className="reading-nav">
            <nav aria-label="Jump to an exam">
              <p className="eyebrow">On this page</p>
              {exams.map((exam, i) => (
                <a key={exam.slug} href={`#${exam.slug}`}>
                  <span>0{i + 1}</span>
                  {exam.name}
                </a>
              ))}
              <a href="#application-checklist">Application checklist</a>
            </nav>
          </aside>
          <div className="min-w-0">
            {exams.map((exam, i) => (
              <article
                id={exam.slug}
                key={exam.slug}
                className={`exam-guide theme-${exam.slug}`}
                aria-labelledby={`${exam.slug}-title`}
              >
                <header className="exam-guide-header">
                  <span className="guide-number">0{i + 1}</span>
                  <div>
                    <p className="eyebrow">{exam.category}</p>
                    <h2 id={`${exam.slug}-title`}>{exam.name}</h2>
                    <p>{exam.fullName}</p>
                  </div>
                </header>
                <div className="exam-guide-body">
                  <p className="guide-summary">{exam.summary}</p>
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
                      Historical dates and published schedules. Later official
                      notices take precedence.
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
                    <OfficialAnchor
                      link={exam.application}
                      className="button-primary"
                    />
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
            ))}
            <section id="application-checklist" className="checklist-panel">
              <p className="eyebrow">Before you apply</p>
              <h2>
                A little preparation.
                <br />A clearer application.
              </h2>
              <ol>
                {[
                  "Shortlist the course and institution, then check the exact eligibility and required subjects.",
                  "Read the current-cycle bulletin and confirm that registration is open on the official site.",
                  "Prepare the documents, photo and signature in the formats requested by the organiser.",
                  "Review your details, pay only through the official portal and save the confirmation page.",
                  "Track correction windows, admit cards, results and counselling separately.",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              <p className="mt-5 text-sm">
                Admission, scholarships and career outcomes depend on the
                programme and its conditions. MockStride helps you discover and
                understand these routes; it does not guarantee a seat.
              </p>
              <a href="#main-content" className="text-link mt-5">
                Back to the top ↑
              </a>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
