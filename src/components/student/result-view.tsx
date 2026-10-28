"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, Lightbulb, Target, TrendingUp } from "lucide-react";
import { ScientificRenderer, type Block } from "@/components/ui/scientific-renderer";
import { EXAMS, SUBJECT_NAMES, isExamSlug, isSubjectId } from "@/lib/exams/catalog";
import { QUALITY_LABEL, type AttemptAnalysis, type Quality } from "@/lib/analysis";
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
    difficulty: string | null;
    content: Block[];
    options: { key: string; content: Block[] }[];
    correctOptionId: string;
    explanation: Block[];
  }[];
  answers: { assignmentId: string; value: string | null; marked: boolean }[];
  analysis: AttemptAnalysis;
};

type Tab = "overview" | "time" | "topics" | "quality" | "review";
type Filter = "all" | "wrong" | "unanswered" | "correct";
const LETTERS = ["A", "B", "C", "D", "E", "F"];
const QUALITY_ORDER: Quality[] = ["fast-correct", "slow-correct", "rushed-wrong", "struggled-wrong", "time-sink-skip", "skipped", "not-reached"];

const fmt = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
};

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
  const [tab, setTab] = useState<Tab>("overview");
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

  const { result, questions, analysis: a } = data;
  const answers = new Map(data.answers.map((x) => [x.assignmentId, x]));
  const sectionName = new Map(data.sections.map((s) => [s.id, s.name]));
  const totals = result.breakdown.sections.reduce(
    (t, s) => ({ correct: t.correct + s.correct, wrong: t.wrong + s.wrong, unanswered: t.unanswered + s.unanswered }),
    { correct: 0, wrong: 0, unanswered: 0 },
  );
  const attempted = totals.correct + totals.wrong;
  const accuracy = attempted ? Math.round((totals.correct / attempted) * 100) : 0;
  const avgMs = Math.round(a.time.usedMs / Math.max(1, questions.length));
  const exam = data.test.exam && isExamSlug(data.test.exam) ? EXAMS[data.test.exam] : null;
  const subject = data.test.subject && isSubjectId(data.test.subject) ? data.test.subject : null;
  const siblings = (catalog?.tests ?? []).filter((t) => t.exam === data.test.exam && (t.subject ?? null) === subject);
  const nextTest = siblings.find((t) => t.testNumber === (data.test.testNumber ?? 0) + 1);
  const otherFree = (catalog?.tests ?? []).filter((t) => t.testId !== data.test.testId && t.access === "free" && !t.latestAttempt);
  const withinReach = a.recoverable.rushedPenalty + a.recoverable.changedAwayFromRight;
  const timingRecorded = a.time.usedMs > 0;

  return (
    <div className="results">
      <header className="results-head">
        <div>
          <p className="eyebrow">
            {data.attempt.status === "timed_out" ? "Submitted when time ran out" : "Submitted"} · {data.test.title}
          </p>
          <h1>
            {result.score} <em>/ {result.maxScore}</em>
          </h1>
        </div>
        <Link href="/student/analysis" className="student-secondary">
          <TrendingUp size={16} /> Your overall analysis
        </Link>
      </header>

      <div className="kpi-grid">
        <Kpi label="Accuracy on attempted" value={`${accuracy}%`} sub={`${totals.correct} correct · ${totals.wrong} wrong · ${totals.unanswered} unanswered`} />
        <Kpi label="Time used" value={timingRecorded ? fmt(a.time.usedMs) : "—"} sub={`of ${fmt(a.time.durationMs)}`} />
        <Kpi
          label="Average per question"
          value={timingRecorded ? fmt(avgMs) : "—"}
          sub={`ideal pace ${fmt(a.time.targetMs)}`}
          tone={timingRecorded ? (avgMs > a.time.targetMs * 1.1 ? "warn" : "good") : undefined}
        />
        <Kpi label="Marks within reach" value={`+${withinReach}`} sub="from rushed answers and changes away from right" tone={withinReach ? "warn" : "good"} />
      </div>

      {a.insights.length > 0 && (
        <section className="insights" aria-labelledby="insights-title">
          <h2 id="insights-title">
            <Lightbulb size={20} aria-hidden="true" /> What this test says about you
          </h2>
          <ol>
            {a.insights.map((insight) => (
              <li key={insight.title}>
                <strong>{insight.title}</strong>
                <p>{insight.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="result-tabs" role="tablist" aria-label="Analysis">
        {(
          [
            ["overview", "Overview"],
            ["time", "Time analysis"],
            ["topics", "Topics & difficulty"],
            ["quality", "Attempt quality"],
            ["review", "Review answers"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="tab-panel" role="tabpanel">
          <div className="panel-grid">
            <section className="panel">
              <h3>Where your marks went</h3>
              <Donut
                parts={[
                  { label: "Correct", value: totals.correct, cls: "c-correct" },
                  { label: "Wrong", value: totals.wrong, cls: "c-wrong" },
                  { label: "Unanswered", value: totals.unanswered, cls: "c-skip" },
                ]}
                center={`${accuracy}%`}
                centerLabel="accuracy"
              />
            </section>
            <section className="panel">
              <h3>Sections</h3>
              {result.breakdown.bestSections && <p className="panel-note">Only your best {result.breakdown.bestSections} sections count, as in the official exam.</p>}
              <ul className="bars">
                {result.breakdown.sections.map((s) => (
                  <li key={s.sectionId} className={s.counted ? "" : "muted"}>
                    <span>
                      {sectionName.get(s.sectionId) ?? s.subject}
                      {!s.counted && " (not counted)"}
                    </span>
                    <b>
                      <i style={{ width: `${Math.max(0, s.score) / s.maxScore * 100}%` }} />
                    </b>
                    <small>
                      {s.score}/{s.maxScore}
                    </small>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <section className="panel next-panel">
            <h3>Your next step</h3>
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
              {otherFree.slice(0, 3).map((t) => (
                <Link key={t.testId} className="student-secondary" href={`/student/tests/${t.testId}`}>
                  Free {t.subject && isSubjectId(t.subject) ? SUBJECT_NAMES[t.subject] : t.title} test
                </Link>
              ))}
              <Link className="student-text-button" href="/student">
                All tests <ArrowRight size={15} />
              </Link>
            </div>
          </section>
        </div>
      )}

      {tab === "time" && (
        <div className="tab-panel" role="tabpanel">
          {!timingRecorded && <p className="panel-note">Time per question wasn&apos;t recorded for this attempt.</p>}
          <section className="panel">
            <h3>Time on every question</h3>
            <p className="panel-note">Bars are coloured by outcome. The dashed line is the ideal pace of {fmt(a.time.targetMs)} per question.</p>
            <TimeChart perQuestion={a.time.perQuestion} targetMs={a.time.targetMs} />
            <QualityLegend />
          </section>
          <div className="panel-grid">
            <section className="panel">
              <h3>Average time by outcome</h3>
              <ul className="bars">
                {[
                  ["Correct answers", a.time.correct, "c-correct"],
                  ["Wrong answers", a.time.wrong, "c-wrong"],
                  ["Unanswered", a.time.unanswered, "c-skip"],
                ].map(([label, t, cls]) => {
                  const tt = t as { avgMs: number; count: number };
                  const maxAvg = Math.max(a.time.correct.avgMs, a.time.wrong.avgMs, a.time.unanswered.avgMs, a.time.targetMs);
                  return (
                    <li key={label as string}>
                      <span>{label as string}</span>
                      <b>
                        <i className={cls as string} style={{ width: `${(tt.avgMs / maxAvg) * 100}%` }} />
                      </b>
                      <small>{fmt(tt.avgMs)}</small>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="panel">
              <h3>Time by section vs ideal</h3>
              <ul className="bars">
                {a.sections.map((s) => (
                  <li key={s.name}>
                    <span>{s.name}</span>
                    <b>
                      <i className={s.timeMs > s.idealMs * 1.1 ? "c-wrong" : "c-correct"} style={{ width: `${Math.min(100, (s.timeMs / Math.max(1, s.idealMs)) * 50)}%` }} />
                      <em className="ideal-mark" />
                    </b>
                    <small>
                      {fmt(s.timeMs)} / {fmt(s.idealMs)}
                    </small>
                  </li>
                ))}
              </ul>
              <p className="panel-note">The marker shows the ideal time for each section.</p>
            </section>
          </div>
          {a.timeSinks.length > 0 && (
            <section className="panel">
              <h3>
                <Clock3 size={18} aria-hidden="true" /> Time sinks
              </h3>
              <p className="panel-note">Questions that took over 1.5× the ideal time without a correct answer.</p>
              <ul className="sink-list">
                {a.timeSinks.map((t) => (
                  <li key={`${t.sectionName}-${t.number}`}>
                    <strong>
                      {t.sectionName} Q{t.number}
                    </strong>
                    <span>{t.topics.join(", ")}</span>
                    <span>{QUALITY_LABEL[t.quality]}</span>
                    <b>{fmt(t.timeMs)}</b>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {tab === "topics" && (
        <div className="tab-panel" role="tabpanel">
          <section className="panel">
            <h3>
              <Target size={18} aria-hidden="true" /> Topics, by marks lost
            </h3>
            <div className="table-scroll">
              <table className="topic-table">
                <thead>
                  <tr>
                    <th scope="col">Topic</th>
                    <th scope="col">Accuracy</th>
                    <th scope="col">Correct / Qs</th>
                    <th scope="col">Avg time</th>
                    <th scope="col">Marks lost</th>
                  </tr>
                </thead>
                <tbody>
                  {a.topics.map((t) => (
                    <tr key={t.name}>
                      <th scope="row">{t.name}</th>
                      <td>
                        <span className="acc-bar">
                          <i style={{ width: `${t.accuracy ?? 0}%` }} className={(t.accuracy ?? 0) >= 75 ? "c-correct" : (t.accuracy ?? 0) >= 50 ? "c-mid" : "c-wrong"} />
                        </span>
                        {t.accuracy === null ? "—" : `${t.accuracy}%`}
                      </td>
                      <td>
                        {t.correct}/{t.total}
                      </td>
                      <td>{timingRecorded ? fmt(t.avgMs) : "—"}</td>
                      <td>{t.marksLost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {a.difficulty.length > 0 && (
            <section className="panel">
              <h3>By difficulty</h3>
              <div className="diff-grid">
                {a.difficulty.map((d) => (
                  <div key={d.name} className="diff-card">
                    <span className="diff-name">{d.name}</span>
                    <strong>{d.accuracy === null ? "—" : `${d.accuracy}%`}</strong>
                    <small>
                      accuracy · {d.correct}/{d.total} correct
                    </small>
                    <small>{timingRecorded ? `${fmt(d.avgMs)} average` : ""}</small>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "quality" && (
        <div className="tab-panel" role="tabpanel">
          <section className="panel">
            <h3>How you attempted each question</h3>
            <p className="panel-note">Every question is placed by its outcome and the time you spent, compared with the ideal pace.</p>
            <ul className="quality-grid">
              {QUALITY_ORDER.map((k) => (
                <li key={k} className={`q-${k}`}>
                  <strong>{a.qualities[k]}</strong>
                  <span>{QUALITY_LABEL[k]}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="panel-grid">
            <section className="panel">
              <h3>Answer changes</h3>
              {a.changes.total === 0 ? (
                <p className="panel-note">You didn&apos;t change any answers.</p>
              ) : (
                <ul className="change-list">
                  <li className="good">
                    <strong>{a.changes.wrongToRight}</strong> wrong → right
                  </li>
                  <li className="bad">
                    <strong>{a.changes.rightToWrong}</strong> right → wrong
                  </li>
                  <li>
                    <strong>{a.changes.wrongToWrong}</strong> wrong → wrong
                  </li>
                </ul>
              )}
            </section>
            <section className="panel">
              <h3>Marked for review</h3>
              {a.review.marked === 0 ? (
                <p className="panel-note">You didn&apos;t mark any questions.</p>
              ) : (
                <ul className="change-list">
                  <li>
                    <strong>{a.review.marked}</strong> marked
                  </li>
                  <li className="good">
                    <strong>{a.review.markedCorrect}</strong> of them correct
                  </li>
                  <li className="bad">
                    <strong>{a.review.markedUnanswered}</strong> left unanswered
                  </li>
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      {tab === "review" && (
        <div className="tab-panel" role="tabpanel">
          <div className="review-filters" role="group" aria-label="Show questions">
            {(["all", "wrong", "unanswered", "correct"] as Filter[]).map((f) => (
              <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? `All (${questions.length})` : `${f[0].toUpperCase()}${f.slice(1)} (${totals[f]})`}
              </button>
            ))}
          </div>
          <ol className="review-list">
            {questions.map((q, i) => {
              const value = answers.get(q.assignmentId)?.value;
              const status = !value ? "unanswered" : value === q.correctOptionId ? "correct" : "wrong";
              if (filter !== "all" && filter !== status) return null;
              const info = a.questions[i];
              return (
                <li key={q.assignmentId} className={`student-panel review-question review-${status}`}>
                  <p className="question-meta">
                    <span>
                      {data.sections.length > 1 ? `${info.sectionName} · ` : ""}Question {info.number} · {q.topics.join(", ")}
                      {q.difficulty ? ` · ${q.difficulty}` : ""}
                    </span>
                    <span className={`review-status status-${status}`}>
                      {status === "correct" ? `+${q.marks}` : status === "wrong" ? `−${q.penalty}` : "0"} ·{" "}
                      {timingRecorded ? `${fmt(info.timeMs)} · ` : ""}
                      {QUALITY_LABEL[info.quality]}
                    </span>
                  </p>
                  <ScientificRenderer content={q.content} />
                  <ul className="review-options">
                    {q.options.map((o, j) => (
                      <li
                        key={o.key}
                        className={`${o.key === q.correctOptionId ? "is-correct" : ""} ${o.key === value && o.key !== q.correctOptionId ? "is-wrong" : ""}`}
                      >
                        <span className="option-letter">{LETTERS[j]}</span>
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
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "good" | "warn" }) {
  return (
    <div className={`kpi${tone ? ` kpi-${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function Donut({ parts, center, centerLabel }: { parts: { label: string; value: number; cls: string }[]; center: string; centerLabel: string }) {
  const total = parts.reduce((n, p) => n + p.value, 0) || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  // Each segment starts where the previous ones end.
  const segments = parts.map((p, i) => ({
    ...p,
    len: (p.value / total) * c,
    start: parts.slice(0, i).reduce((n, q) => n + (q.value / total) * c, 0),
  }));
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" width="160" height="160" role="img" aria-label={parts.map((p) => `${p.value} ${p.label}`).join(", ")}>
        <circle cx="70" cy="70" r={r} className="donut-track" />
        {segments.map((p) => (
          <circle key={p.label} cx="70" cy="70" r={r} className={`donut-seg ${p.cls}`} strokeDasharray={`${p.len} ${c - p.len}`} strokeDashoffset={-p.start} />
        ))}
        <text x="70" y="68" textAnchor="middle" className="donut-value">
          {center}
        </text>
        <text x="70" y="88" textAnchor="middle" className="donut-label">
          {centerLabel}
        </text>
      </svg>
      <ul>
        {parts.map((p) => (
          <li key={p.label}>
            <i className={p.cls} /> {p.label} <strong>{p.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimeChart({ perQuestion, targetMs }: { perQuestion: AttemptAnalysis["time"]["perQuestion"]; targetMs: number }) {
  const max = Math.max(targetMs * 1.5, ...perQuestion.map((p) => p.timeMs));
  const w = 100 / Math.max(1, perQuestion.length);
  return (
    <div className="time-chart" role="img" aria-label="Time spent on each question compared with the ideal pace">
      <span className="target-line" style={{ bottom: `${(targetMs / max) * 100}%` }} />
      {perQuestion.map((p, i) => (
        <i
          key={i}
          className={`q-${p.quality}`}
          style={{ left: `${i * w}%`, width: `calc(${w}% - 2px)`, height: `${Math.max(1.5, (p.timeMs / max) * 100)}%` }}
          title={`${p.sectionName} Q${p.number}: ${fmt(p.timeMs)} · ${QUALITY_LABEL[p.quality]}`}
        />
      ))}
    </div>
  );
}

function QualityLegend() {
  return (
    <ul className="quality-legend">
      {QUALITY_ORDER.map((k) => (
        <li key={k}>
          <i className={`q-${k}`} /> {QUALITY_LABEL[k]}
        </li>
      ))}
    </ul>
  );
}
