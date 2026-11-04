"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BrainCircuit,
  Code2,
  Dna,
  FileSpreadsheet,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Radio,
  Scale,
  Sigma,
  TrendingUp,
} from "lucide-react";
import { blueprintFor } from "@/lib/blueprints/definitions";
import { EXAMS, EXAM_SLUGS, SUBJECT_DETAILS, SUBJECT_NAMES, isExamSlug, type ExamSlug, type SubjectId } from "@/lib/exams/catalog";
import { WaitlistForm } from "@/components/waitlist-form";

const SUBJECT_ICONS: Record<SubjectId, typeof Sigma> = {
  mathematics: Sigma,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  accountancy: FileSpreadsheet,
  "computer-science": Code2,
  economics: TrendingUp,
  english: Languages,
  "general-test": BrainCircuit,
  geography: Globe,
  history: Landmark,
  "mass-media": Radio,
  "political-science": Scale,
};

type Attempt = { attemptId: string; status: string; score: number | null; maxScore: number | null };
type CatalogTest = { testId: string; exam: string; subject: string | null; testNumber: number; latestAttempt: Attempt | null };
type Mine = { testId: string; attempt: Attempt | null };

const key = (exam: string, subject?: string | null) => `${exam}:${subject ?? ""}`;

/** One line for the official pattern, read from the blueprint so it changes with the bulletin. */
function patternLine(exam: ExamSlug, subject?: SubjectId) {
  const bp = blueprintFor(exam, subject ?? "mathematics")!;
  const { marksPerQuestion, penaltyPerQuestion } = bp.sections[0];
  const marking = penaltyPerQuestion ? `+${marksPerQuestion} / −${penaltyPerQuestion}` : `+${marksPerQuestion}, no negative marking`;
  const nest = exam === "niser-nest" ? " · best 3 of 4 sections count" : "";
  return `${bp.totalQuestions} questions · ${bp.durationMinutes} min · ${bp.totalMarks} marks · ${marking}${nest}`;
}

/**
 * `live` lists "exam:subject" for every published free Test 1, so a paper uploaded in the admin panel appears here
 * without a code change. It is null when the database isn't connected; CUET is then shown as available.
 */
export function FreeDiagnosticClient({ initialExam, live }: { initialExam?: string; live: string[] | null }) {
  const [tab, setTab] = useState<ExamSlug>(initialExam && isExamSlug(initialExam) ? initialExam : "cuet-ug");
  const [mine, setMine] = useState<Map<string, Mine>>(new Map());

  // Signed-in students see their own Test 1 status on each card.
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((session) => (session?.user ? fetch("/api/student/catalog").then((r) => (r.ok ? r.json() : null)) : null))
      .then((data: { tests: CatalogTest[] } | null) => {
        if (!active || !data) return;
        const tests = data.tests.filter((t) => t.testNumber === 1);
        setMine(new Map(tests.map((t) => [key(t.exam, t.subject), { testId: t.testId, attempt: t.latestAttempt }])));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const isLive = (exam: ExamSlug, subject?: SubjectId) => (live ? live.includes(key(exam, subject)) : exam === "cuet-ug");
  const cuetLive = EXAMS["cuet-ug"].subjects.filter((s) => isLive("cuet-ug", s)).length;
  const exam = EXAMS[tab];

  function action(examSlug: ExamSlug, subject?: SubjectId) {
    if (!isLive(examSlug, subject)) return <p className="fd-soon">Free test coming soon</p>;
    const own = mine.get(key(examSlug, subject));
    const attempt = own?.attempt;
    if (attempt?.status === "in_progress")
      return (
        <Link className="button-primary" href={`/student/exam/${attempt.attemptId}`}>
          Resume test <ArrowRight size={16} aria-hidden="true" />
        </Link>
      );
    if (attempt && attempt.score !== null)
      return (
        <>
          <p className="fd-score">
            Your score <strong>{attempt.score}/{attempt.maxScore}</strong>
          </p>
          <div className="fd-actions">
            <Link className="button-primary" href={`/student/results/${attempt.attemptId}`}>
              View analysis
            </Link>
            <Link className="text-link" href={`/student/tests/${own!.testId}`}>
              Take again
            </Link>
          </div>
        </>
      );
    const start = `/student/start?exam=${examSlug}${subject ? `&subject=${subject}` : ""}&test=1`;
    return (
      <Link className="button-primary" href={start}>
        Start free Test 1 <ArrowRight size={16} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">Free full-length mock tests</p>
        <h1>
          Test 1 is free
          <br />
          <em>for every exam.</em>
        </h1>
        <p className="hero-copy">
          Full length, timed, on the official pattern and marking, followed by question-by-question time analysis:
          where you rushed, where you got stuck and which topics cost you marks.
        </p>
      </section>

      <section className="page-shell fd-section" aria-label="Choose an exam">
        <div className="fd-tabs" role="tablist" aria-label="Exam">
          {EXAM_SLUGS.map((slug) => {
            const badge =
              slug === "cuet-ug" ? `${cuetLive} subject${cuetLive === 1 ? "" : "s"} free` : isLive(slug) ? "Test 1 free" : "Coming soon";
            return (
              <button
                key={slug}
                type="button"
                role="tab"
                id={`fd-tab-${slug}`}
                aria-selected={tab === slug}
                aria-controls="fd-panel"
                onClick={() => setTab(slug)}
              >
                {EXAMS[slug].name}
                <span>{badge}</span>
              </button>
            );
          })}
        </div>

        <div id="fd-panel" role="tabpanel" aria-labelledby={`fd-tab-${tab}`} className="fd-panel">
          <header className="fd-panel-head">
            <div>
              <h2>{exam.name}: free Test 1</h2>
              <p>
                {exam.paperPerSubject ? `Each subject paper: ${patternLine(tab)}` : patternLine(tab)}
                {exam.maxSubjects ? `. Candidates take up to ${exam.maxSubjects} subjects.` : "."}
              </p>
            </div>
            <Link className="text-link" href={`/exams/${tab}`}>
              {exam.shortName} exam guide
            </Link>
          </header>

          {exam.paperPerSubject ? (
            <ul className="fd-grid">
              {exam.subjects.map((subject) => {
                const Icon = SUBJECT_ICONS[subject];
                const live = isLive(tab, subject);
                return (
                  <li key={subject} className={`fd-card${live ? "" : " is-soon"}`}>
                    <span className="fd-icon" aria-hidden="true">
                      <Icon size={22} />
                    </span>
                    <p className="fd-code">CUET code {SUBJECT_DETAILS[subject].code}</p>
                    <h3>{SUBJECT_NAMES[subject]}</h3>
                    <p className="fd-sub">{SUBJECT_DETAILS[subject].subtitle}</p>
                    <div className="fd-card-action">{action(tab, subject)}</div>
                  </li>
                );
              })}
            </ul>
          ) : isLive(tab) ? (
            <div className="fd-card fd-single">
              <h3>{exam.name} Test 1</h3>
              <p className="fd-sub">Sections: {exam.subjects.map((s) => SUBJECT_NAMES[s]).join(", ")}.</p>
              <div className="fd-card-action">{action(tab)}</div>
            </div>
          ) : (
            <WaitlistForm
              key={tab}
              defaultExam={tab}
              headline={`${exam.name} Test 1 is being prepared`}
              subheadline="Leave your email and we'll tell you the day it goes live."
              source="free-diagnostic"
            />
          )}
        </div>
      </section>
    </main>
  );
}
