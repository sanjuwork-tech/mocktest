import { pageMetadata } from "@/lib/page-metadata";
import { BookOpen, CalendarDays, CheckCircle2 } from "lucide-react";
import { ExamDirectory } from "@/components/exam-directory";
import { exams, reviewIsStale } from "@/data/exams";
import {
  ExamGuideArticle,
  OfficialAnchor,
} from "@/components/exam-guide-article";

export const revalidate = 86400;
export const metadata = pageMetadata(
  "Exams after Class 12 — CUET, IAT, NEST & COMEDK",
  "Explore four entrance exams in one place: opportunities, eligibility, dates, official notifications and candidate links.",
  "/exams",
);

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
              <ExamGuideArticle
                key={exam.slug}
                exam={exam}
                index={i}
                now={now}
              />
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
                programme and its conditions. TestDisha helps you discover and
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
