"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Lock, PlayCircle, RotateCcw } from "lucide-react";
import {
  EXAMS,
  EXAM_SLUGS,
  SUBJECT_DETAILS,
  SUBJECT_NAMES,
  type ExamSlug,
  type SubjectId,
} from "@/lib/exams/catalog";
import { api, type Catalog, type CatalogTest } from "./api";
import { StudentShell } from "./shell";

export function StudentDashboard() {
  return (
    <StudentShell>
      <DashboardContent />
    </StudentShell>
  );
}

function DashboardContent() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [exam, setExam] = useState<ExamSlug>("cuet-ug");
  const [subject, setSubject] = useState<SubjectId | null>(null);

  useEffect(() => {
    api<Catalog>("/api/student/catalog")
      .then(setCatalog)
      .catch((e: Error) => setError(e.message));
  }, []);

  const testsFor = useMemo(() => {
    const tests = catalog?.tests ?? [];
    return (examSlug: ExamSlug, subjectId: SubjectId | null) =>
      tests.filter((t) => t.exam === examSlug && (t.subject ?? null) === subjectId);
  }, [catalog]);

  if (error)
    return (
      <p className="student-warning" role="alert">
        {error}
      </p>
    );
  if (!catalog) return <p role="status">Loading your tests…</p>;

  const inProgress = catalog.recentAttempts.find((a) => a.status === "in_progress");
  const firstName = catalog.student.name.split(" ")[0];
  const examDef = EXAMS[exam];

  return (
    <>
      <section className="student-dashboard-hero">
        <p className="eyebrow">Your practice space</p>
        <h1>
          Hello, {firstName}.
          <br />
          <em>Pick a paper and begin.</em>
        </h1>
        <Link href="/student/analysis" className="student-secondary dashboard-analysis-link">
          Your overall analysis →
        </Link>
        {inProgress && (
          <Link href={`/student/exam/${inProgress.attemptId}`} className="button-primary">
            <RotateCcw size={18} /> Resume {inProgress.title}
          </Link>
        )}
      </section>

      <div className="exam-tabs" role="tablist" aria-label="Exams">
        {EXAM_SLUGS.map((slug) => (
          <button
            key={slug}
            role="tab"
            aria-selected={exam === slug}
            onClick={() => {
              setExam(slug);
              setSubject(null);
            }}
          >
            {EXAMS[slug].shortName}
          </button>
        ))}
      </div>

      {examDef.paperPerSubject && !subject ? (
        <section className="student-section" aria-labelledby="subjects-title">
          <div className="section-heading">
            <h2 id="subjects-title">Choose a {examDef.name} subject</h2>
          </div>
          <p className="student-muted">
            Each subject is its own 50-question, 60-minute paper. You can take up to {examDef.maxSubjects} subjects in
            the real exam.
          </p>
          <div className="student-subject-grid">
            {examDef.subjects.map((id) => {
              const tests = testsFor(exam, id);
              const done = tests.filter((t) => t.latestAttempt && t.latestAttempt.status !== "in_progress").length;
              return (
                <button
                  key={id}
                  className="student-subject-card"
                  style={{ borderTopColor: SUBJECT_DETAILS[id].color }}
                  onClick={() => setSubject(id)}
                >
                  <small>CUET code {SUBJECT_DETAILS[id].code}</small>
                  <strong>{SUBJECT_NAMES[id]}</strong>
                  <span className="student-muted">
                    {tests.length} of {examDef.plannedTests} tests available
                    {done ? ` · ${done} taken` : ""}
                  </span>
                  <span className="student-text-button">
                    View tests <ArrowRight size={15} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <TestList
          title={subject ? `${examDef.shortName} ${SUBJECT_NAMES[subject]}` : examDef.name}
          planned={examDef.plannedTests}
          tests={testsFor(exam, subject)}
          onBack={subject ? () => setSubject(null) : undefined}
          exam={exam}
        />
      )}

      {catalog.recentAttempts.length > 0 && (
        <section className="student-section" aria-labelledby="history-title">
          <h2 id="history-title">Recent attempts</h2>
          <ul className="attempt-history">
            {catalog.recentAttempts.map((a) => (
              <li key={a.attemptId}>
                <span>
                  <strong>{a.title}</strong>
                  <small>{new Date(a.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small>
                </span>
                {a.status === "in_progress" ? (
                  <Link href={`/student/exam/${a.attemptId}`} className="student-text-button">
                    Resume <ArrowRight size={15} />
                  </Link>
                ) : (
                  <Link href={`/student/results/${a.attemptId}`} className="student-text-button">
                    {a.score !== null ? `${a.score}/${a.maxScore}` : "View result"} <ArrowRight size={15} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function TestList({
  title,
  planned,
  tests,
  onBack,
  exam,
}: {
  title: string;
  planned: number;
  tests: CatalogTest[];
  onBack?: () => void;
  exam: ExamSlug;
}) {
  const byNumber = new Map(tests.map((t) => [t.testNumber, t]));
  const hasLocked = tests.some((t) => t.access === "locked");

  return (
    <section className="student-section" aria-labelledby="tests-title">
      {onBack && (
        <button className="student-text-button" onClick={onBack}>
          ← All subjects
        </button>
      )}
      <div className="section-heading">
        <h2 id="tests-title">{title}</h2>
        <span className="student-muted">
          {tests.length} of {planned} tests available
        </span>
      </div>
      {tests.length === 0 && (
        <p className="student-empty">
          Tests for this exam are being prepared. We&apos;ll add them here as soon as each paper is reviewed.
        </p>
      )}
      <ol className="test-list">
        {Array.from({ length: planned }, (_, i) => i + 1).map((n) => {
          const test = byNumber.get(n);
          if (!test)
            return (
              <li key={n} className="test-row is-upcoming">
                <span className="test-number">Test {n}</span>
                <span className="student-muted">Coming soon</span>
              </li>
            );
          const attempt = test.latestAttempt;
          return (
            <li key={n} className={`test-row${test.access === "locked" ? " is-locked" : ""}`}>
              <span className="test-number">Test {n}</span>
              <span className="test-badges">
                {test.access === "free" && <span className="badge-free">Free</span>}
                {test.access === "locked" && (
                  <span className="badge-locked">
                    <Lock size={12} aria-hidden="true" /> Series
                  </span>
                )}
                <span className="student-muted">
                  <Clock3 size={13} aria-hidden="true" /> {test.durationMinutes} min · {test.totalMarks} marks
                </span>
                {attempt && attempt.score !== null && (
                  <span className="badge-score">
                    <CheckCircle2 size={12} aria-hidden="true" /> Last score {attempt.score}/{attempt.maxScore}
                  </span>
                )}
              </span>
              {test.access === "locked" ? (
                <Link href={`/test-series/${exam}`} className="student-text-button">
                  Unlock <ArrowRight size={15} />
                </Link>
              ) : attempt?.status === "in_progress" ? (
                <Link href={`/student/exam/${attempt.attemptId}`} className="student-text-button">
                  Resume <ArrowRight size={15} />
                </Link>
              ) : (
                <Link href={`/student/tests/${test.testId}`} className="student-text-button">
                  <PlayCircle size={15} /> {attempt ? "Retake" : "Start"}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {hasLocked && (
        <p className="student-muted">
          Locked tests are part of the {EXAMS[exam].shortName} series. Test 1 is always free.
        </p>
      )}
    </section>
  );
}
