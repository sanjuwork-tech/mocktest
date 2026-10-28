"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, TrendingDown, TrendingUp } from "lucide-react";
import { SUBJECT_NAMES, EXAMS, isSubjectId, isExamSlug } from "@/lib/exams/catalog";
import type { analyseOverall } from "@/lib/analysis";
import { api } from "./api";
import { StudentShell } from "./shell";

type Overall = ReturnType<typeof analyseOverall>;

const subjectLabel = (key: string) => (isSubjectId(key) ? SUBJECT_NAMES[key] : isExamSlug(key) ? EXAMS[key].shortName : key);

export function OverallAnalysis() {
  return (
    <StudentShell>
      <Content />
    </StudentShell>
  );
}

function Content() {
  const [data, setData] = useState<{ overall: Overall; student: { name: string } } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ overall: Overall; student: { name: string } }>("/api/student/analysis").then(setData, (e: Error) => setError(e.message));
  }, []);

  if (error)
    return (
      <p className="student-warning" role="alert">
        {error}
      </p>
    );
  if (!data) return <p role="status">Building your analysis…</p>;
  const o = data.overall;

  if (o.attempts === 0)
    return (
      <section className="student-empty">
        <h1>Your analysis starts with your first test.</h1>
        <p>Finish a full test and we&apos;ll track your scores, topics and time habits across every attempt.</p>
        <Link href="/student" className="button-primary">
          Choose a test <ArrowRight size={16} />
        </Link>
      </section>
    );

  const maxPercent = 100;
  const w = 100 / Math.max(1, o.trend.length);

  return (
    <div className="results">
      <header className="results-head">
        <div>
          <p className="eyebrow">Overall analysis · {o.attempts} test{o.attempts > 1 ? "s" : ""}</p>
          <h1>
            {data.student.name.split(" ")[0]}&apos;s progress
          </h1>
        </div>
        {o.change !== null && (
          <span className={`trend-chip ${o.change >= 0 ? "up" : "down"}`}>
            {o.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {o.change >= 0 ? "+" : ""}
            {o.change} points since your first test
          </span>
        )}
      </header>

      <section className="panel">
        <h3>Score trend</h3>
        <p className="panel-note">Percentage of the maximum score in each test, oldest first.</p>
        <div className="trend-chart" role="img" aria-label={`Scores: ${o.trend.map((t) => `${t.title} ${t.percent}%`).join(", ")}`}>
          {o.trend.map((t, i) => (
            <Link key={t.attemptId} href={`/student/results/${t.attemptId}`} className="trend-bar" style={{ left: `${i * w}%`, width: `calc(${w}% - 6px)` }}>
              <i style={{ height: `${(Math.max(0, t.percent) / maxPercent) * 100}%` }} />
              <span>{t.percent}%</span>
            </Link>
          ))}
        </div>
        <div className="table-scroll">
          <table className="topic-table">
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Score</th>
                <th scope="col">Avg time / question</th>
                <th scope="col">Rushed wrong answers</th>
              </tr>
            </thead>
            <tbody>
              {[...o.trend].reverse().map((t) => (
                <tr key={t.attemptId}>
                  <th scope="row">
                    <Link href={`/student/results/${t.attemptId}`}>{t.title}</Link>
                  </th>
                  <td>
                    {t.score}/{t.maxScore}
                  </td>
                  <td>{t.avgSecPerQuestion ? `${t.avgSecPerQuestion}s` : "—"}</td>
                  <td>{t.rushedWrong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="panel-grid">
        <section className="panel">
          <h3>Topics to focus on</h3>
          <p className="panel-note">Ranked by marks lost across all your tests.</p>
          <ul className="bars">
            {o.focus.map((t) => (
              <li key={`${t.subject}:${t.name}`}>
                <span>
                  {t.name} <small className="muted-label">{subjectLabel(t.subject)}</small>
                </span>
                <b>
                  <i className={(t.accuracy ?? 0) >= 75 ? "c-correct" : (t.accuracy ?? 0) >= 50 ? "c-mid" : "c-wrong"} style={{ width: `${t.accuracy ?? 0}%` }} />
                </b>
                <small>−{t.marksLost}</small>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h3>Topics you&apos;ve mastered</h3>
          {o.mastered.length === 0 ? (
            <p className="panel-note">Topics appear here once you reach 80% accuracy over at least four questions.</p>
          ) : (
            <ul className="bars">
              {o.mastered.map((t) => (
                <li key={`${t.subject}:${t.name}`}>
                  <span>{t.name}</span>
                  <b>
                    <i className="c-correct" style={{ width: `${t.accuracy}%` }} />
                  </b>
                  <small>{t.accuracy}%</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="panel-grid">
        <section className="panel">
          <h3>By subject</h3>
          <ul className="bars">
            {o.subjects.map((s) => (
              <li key={s.subject}>
                <span>
                  {subjectLabel(s.subject)} <small className="muted-label">{s.attempts} test{s.attempts > 1 ? "s" : ""}</small>
                </span>
                <b>
                  <i style={{ width: `${Math.max(0, s.lastPercent)}%` }} />
                </b>
                <small>
                  {s.lastPercent}% · best {s.bestPercent}%
                </small>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h3>Your test-taking habits</h3>
          <ul className="change-list">
            <li className={o.totals.rushedWrong ? "bad" : "good"}>
              <strong>{o.totals.rushedWrong}</strong> rushed wrong answers
            </li>
            <li className="good">
              <strong>{o.totals.wrongToRight}</strong> answers corrected on review
            </li>
            <li className={o.totals.rightToWrong ? "bad" : "good"}>
              <strong>{o.totals.rightToWrong}</strong> right answers changed to wrong
            </li>
            <li>
              <strong>{o.totals.timeSinks}</strong> time-sink questions
            </li>
          </ul>
        </section>
      </div>

      {o.plan.length > 0 && (
        <section className="insights">
          <h2>
            <Compass size={20} aria-hidden="true" /> Your plan for the next test
          </h2>
          <ol>
            {o.plan.map((p) => (
              <li key={p}>
                <p>{p}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
