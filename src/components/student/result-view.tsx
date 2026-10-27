"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, CircleMinus, XCircle } from "lucide-react";
import { ScientificRenderer, type Block } from "@/components/ui/scientific-renderer";
import { EXAMS, SUBJECT_NAMES, isExamSlug, isSubjectId } from "@/lib/exams/catalog";
import { api, type Catalog } from "./api";
import { StudentShell } from "./shell";

type Tally = { total: number; correct: number; wrong: number; unanswered: number };
type SectionResult = Tally & { sectionId: string; subject: string; score: number; maxScore: number; counted: boolean };

type ResultData = {
  attempt: { id: string; status: "submitted" | "timed_out"; submittedAt: string | null };
  result: {
    score: number;
    maxScore: number;
    breakdown: { sections: SectionResult[]; topics: Record<string, Tally>; bestSections: number | null };
  };
  test: { testId: string; title: string; exam: string | null; subject: string | null; testNumber: number | null };
  sections: { id: string; name: string }[];
  questions: {
    assignmentId: string;
    sectionId: string;
    marks: number;
    penalty: number;
    topics: string[];
    content: Block[];
    options: { key: string; content: Block[] }[];
    correctOptionId: string;
    explanation: Block[];
  }[];
  answers: { assignmentId: string; value: string | null; marked: boolean }[];
};

type Filter = "all" | "wrong" | "unanswered" | "correct";
const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function ResultView({ attemptId }: { attemptId: string }) {
  return (
    <StudentShell>
      <Result attemptId={attemptId} />
    </StudentShell>
  );
}

function Result({ attemptId }: { attemptId: string }) {
  const [data, setData] = useState<ResultData | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    api<ResultData>(`/api/results/${attemptId}`).then(setData, (e: Error) => setError(e.message));
    api<Catalog>("/api/student/catalog").then(setCatalog, () => undefined);
  }, [attemptId]);

  if (error)
    return (
      <p className="student-warning" role="alert">
        {error} <Link href="/student">Back to your tests</Link>
      </p>
    );
  if (!data) return <p role="status">Preparing your analysis…</p>;

  const { result, questions } = data;
  const answers = new Map(data.answers.map((a) => [a.assignmentId, a]));
  const totals = result.breakdown.sections.reduce(
    (t, s) => ({ correct: t.correct + s.correct, wrong: t.wrong + s.wrong, unanswered: t.unanswered + s.unanswered }),
    { correct: 0, wrong: 0, unanswered: 0 },
  );
  const attempted = totals.correct + totals.wrong;
  const accuracy = attempted ? Math.round((totals.correct / attempted) * 100) : 0;
  const sectionName = new Map(data.sections.map((s) => [s.id, s.name]));
  const marksPerQuestion = questions[0]?.marks ?? 1;
  const penalty = questions[0]?.penalty ?? 0;

  // Topics ranked by marks lost: wrong answers cost marks + penalty, unanswered cost marks.
  const topics = Object.entries(result.breakdown.topics)
    .map(([name, t]) => ({ name, ...t, lost: t.wrong * (marksPerQuestion + penalty) + t.unanswered * marksPerQuestion }))
    .sort((a, b) => b.lost - a.lost);
  const weakest = topics.filter((t) => t.lost > 0).slice(0, 3);

  const exam = data.test.exam && isExamSlug(data.test.exam) ? EXAMS[data.test.exam] : null;
  const subject = data.test.subject && isSubjectId(data.test.subject) ? data.test.subject : null;
  const siblings = (catalog?.tests ?? []).filter((t) => t.exam === data.test.exam && (t.subject ?? null) === subject);
  const nextTest = siblings.find((t) => t.testNumber === (data.test.testNumber ?? 0) + 1);
  const otherSubjects = exam?.paperPerSubject
    ? (catalog?.tests ?? []).filter((t) => t.exam === data.test.exam && t.subject !== subject && t.access === "free" && !t.latestAttempt)
    : [];

  const outcome = (q: ResultData["questions"][number]) => {
    const value = answers.get(q.assignmentId)?.value;
    return !value ? "unanswered" : value === q.correctOptionId ? "correct" : "wrong";
  };
  const shown = questions.filter((q) => filter === "all" || outcome(q) === filter);

  return (
    <>
      <section className="result-heading">
        <div>
          <p className="eyebrow">
            {data.attempt.status === "timed_out" ? "Submitted when time ran out" : "Submitted"} · {data.test.title}
          </p>
          <h1>
            {result.score} <em>/ {result.maxScore}</em>
          </h1>
        </div>
      </section>

      <div className="result-stats">
        <div>
          <CheckCircle2 aria-hidden="true" /> <strong>{totals.correct}</strong> correct
        </div>
        <div>
          <XCircle aria-hidden="true" /> <strong>{totals.wrong}</strong> wrong
        </div>
        <div>
          <CircleMinus aria-hidden="true" /> <strong>{totals.unanswered}</strong> unanswered
        </div>
        <div>
          <strong>{accuracy}%</strong> accuracy on attempted questions
        </div>
      </div>

      {result.breakdown.sections.length > 1 && (
        <section className="student-section" aria-labelledby="sections-title">
          <h2 id="sections-title">Sections</h2>
          {result.breakdown.bestSections && (
            <p className="student-muted">
              As in the official exam, only your best {result.breakdown.bestSections} sections count towards the total.
            </p>
          )}
          <div className="student-table-scroll">
            <table className="result-table">
              <thead>
                <tr>
                  <th scope="col">Section</th>
                  <th scope="col">Score</th>
                  <th scope="col">Correct</th>
                  <th scope="col">Wrong</th>
                  <th scope="col">Unanswered</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.sections.map((s) => (
                  <tr key={s.sectionId} className={s.counted ? "" : "not-counted"}>
                    <th scope="row">
                      {sectionName.get(s.sectionId) ?? s.subject}
                      {!s.counted && <small> (not counted)</small>}
                    </th>
                    <td>
                      {s.score}/{s.maxScore}
                    </td>
                    <td>{s.correct}</td>
                    <td>{s.wrong}</td>
                    <td>{s.unanswered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="student-section next-steps" aria-labelledby="next-title">
        <h2 id="next-title">What to do next</h2>
        <ul>
          {weakest.length > 0 && (
            <li>
              Revise <strong>{weakest.map((t) => t.name).join(", ")}</strong> — these topics cost you the most marks in
              this test.
            </li>
          )}
          {totals.wrong > totals.correct && penalty > 0 && (
            <li>
              Wrong answers cost you {totals.wrong * penalty} marks. When you can&apos;t eliminate at least two options,
              leaving a question blank is usually safer.
            </li>
          )}
        </ul>
        <div className="next-actions">
          {nextTest && nextTest.access !== "locked" && (
            <Link className="button-primary" href={`/student/tests/${nextTest.testId}`}>
              Take Test {nextTest.testNumber} <ArrowRight size={17} />
            </Link>
          )}
          {nextTest && nextTest.access === "locked" && exam && (
            <Link className="button-primary" href={`/test-series/${exam.slug}`}>
              Unlock Tests 2–{exam.plannedTests} <ArrowRight size={17} />
            </Link>
          )}
          {otherSubjects.slice(0, 3).map((t) => (
            <Link key={t.testId} className="student-secondary" href={`/student/tests/${t.testId}`}>
              Free {t.subject && isSubjectId(t.subject) ? SUBJECT_NAMES[t.subject] : t.title} test
            </Link>
          ))}
          <Link className="student-text-button" href="/student">
            All tests <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {topics.length > 1 && (
        <section className="student-section" aria-labelledby="topics-title">
          <h2 id="topics-title">Topics</h2>
          <ul className="topic-bars">
            {topics.map((t) => (
              <li key={t.name}>
                <span className="topic-name">{t.name}</span>
                <span className="topic-bar" role="img" aria-label={`${t.correct} correct, ${t.wrong} wrong, ${t.unanswered} unanswered of ${t.total}`}>
                  <i className="bar-correct" style={{ flexGrow: t.correct }} />
                  <i className="bar-wrong" style={{ flexGrow: t.wrong }} />
                  <i className="bar-unanswered" style={{ flexGrow: t.unanswered }} />
                </span>
                <span className="topic-count">
                  {t.correct}/{t.total}
                </span>
              </li>
            ))}
          </ul>
          <p className="topic-legend">
            <span><i className="bar-correct" /> Correct</span>
            <span><i className="bar-wrong" /> Wrong</span>
            <span><i className="bar-unanswered" /> Unanswered</span>
          </p>
        </section>
      )}

      <section className="student-section" aria-labelledby="review-title">
        <h2 id="review-title">Review answers</h2>
        <div className="review-filters" role="group" aria-label="Show questions">
          {(["all", "wrong", "unanswered", "correct"] as Filter[]).map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? `All (${questions.length})` : `${f[0].toUpperCase()}${f.slice(1)} (${totals[f]})`}
            </button>
          ))}
        </div>
        <ol className="review-list">
          {shown.map((q) => {
            const value = answers.get(q.assignmentId)?.value;
            const status = outcome(q);
            const number = questions.filter((x) => x.sectionId === q.sectionId).indexOf(q) + 1;
            return (
              <li key={q.assignmentId} className={`student-panel review-question review-${status}`}>
                <p className="question-meta">
                  <span>
                    {data.sections.length > 1 ? `${sectionName.get(q.sectionId)} · ` : ""}Question {number} · {q.topics.join(", ")}
                  </span>
                  <span className={`review-status status-${status}`}>
                    {status === "correct" ? `+${q.marks}` : status === "wrong" ? `−${q.penalty}` : "0"} · {status}
                  </span>
                </p>
                <ScientificRenderer content={q.content} />
                <ul className="review-options">
                  {q.options.map((o, i) => (
                    <li
                      key={o.key}
                      className={`${o.key === q.correctOptionId ? "is-correct" : ""} ${o.key === value && o.key !== q.correctOptionId ? "is-wrong" : ""}`}
                    >
                      <span className="option-letter">{LETTERS[i]}</span>
                      <ScientificRenderer content={o.content} />
                      {o.key === q.correctOptionId && <small>Correct answer</small>}
                      {o.key === value && <small>Your answer</small>}
                    </li>
                  ))}
                </ul>
                <div className="worked-explanation">
                  <strong>Explanation</strong>
                  <ScientificRenderer content={q.explanation} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
