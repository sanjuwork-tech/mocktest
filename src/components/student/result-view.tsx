"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { Block } from "@/components/ui/scientific-renderer";
import { EXAMS, SUBJECT_NAMES, isExamSlug, isSubjectId, plannedTestsFor } from "@/lib/exams/catalog";
import type { AttemptAnalysis, InsightTab } from "@/lib/analysis";
import { api, type Catalog } from "./api";
import { StudentShell } from "./shell";
import { Figure, HeatTable, Waterfall } from "./results/charts";
import { fmt, fmtMin, plural } from "./results/format";
import { TimeTab } from "./results/time-tab";
import { TopicsTab } from "./results/topics-tab";
import { DecisionsTab } from "./results/decisions-tab";
import { QuestionReview } from "./results/question-review";

export type ResultData = {
  attempt: { id: string; status: "submitted" | "timed_out"; startedAt: string; submittedAt: string | null };
  result: { score: number; maxScore: number };
  test: { testId: string; title: string; exam: string | null; subject: string | null; testNumber: number | null };
  sections: { id: string; name: string }[];
  questions: {
    assignmentId: string;
    content: Block[];
    options: { key: string; content: Block[] }[];
    correctOptionId: string;
    explanation: Block[];
  }[];
  analysis: AttemptAnalysis;
};

/** Shared by every tab: a question's short name and a way to open it in the review list. */
export type TabProps = { a: AttemptAnalysis; label: (index: number) => string; jump: (index: number) => void };

const TABS: [InsightTab, string][] = [
  ["summary", "Summary"],
  ["time", "Time"],
  ["topics", "Topics"],
  ["decisions", "Decisions"],
  ["questions", "Questions"],
];

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
  // Tabs render only after the data loads on the client, so reading the hash here can't mismatch the server HTML.
  const [tab, setTab] = useState<InsightTab>(() =>
    typeof window === "undefined" ? "summary" : (TABS.find(([id]) => `#${id}` === window.location.hash)?.[0] ?? "summary"),
  );
  const [focus, setFocus] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const a = data.analysis;
  const multi = data.sections.length > 1;
  const label = (i: number) => `${multi ? `${a.questions[i].sectionName} ` : ""}Q${a.questions[i].number}`;
  const show = (t: InsightTab) => {
    setTab(t);
    window.history.replaceState(null, "", `#${t}`);
  };
  const jump = (i: number) => {
    setFocus(i);
    show("questions");
  };
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = (i + step + TABS.length) % TABS.length;
    show(TABS[next][0]);
    tabRefs.current[next]?.focus();
  };
  const props: TabProps = { a, label, jump };

  return (
    <div className="rx">
      <header className="rx-head">
        <p className="rx-meta">
          {data.test.title} · {data.attempt.status === "timed_out" ? "submitted when time ran out" : "submitted"}
          {data.attempt.submittedAt && ` on ${new Date(data.attempt.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
        </p>
        <h1>
          {data.result.score} <em>/ {data.result.maxScore}</em>
        </h1>
        <Link href="/student/analysis" className="student-secondary">
          <TrendingUp size={16} aria-hidden="true" /> Progress across tests
        </Link>
      </header>

      <div className="rx-tabs" role="tablist" aria-label="Result analysis">
        {TABS.map(([id, name], i) => (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            id={`rx-tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`rx-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => show(id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="rx-panel" role="tabpanel" id={`rx-panel-${tab}`} aria-labelledby={`rx-tab-${tab}`}>
        {tab === "summary" && <Summary data={data} catalog={catalog} show={show} {...props} />}
        {tab === "time" && <TimeTab {...props} />}
        {tab === "topics" && <TopicsTab {...props} />}
        {tab === "decisions" && <DecisionsTab {...props} />}
        {tab === "questions" && <QuestionReview data={data} focus={focus} {...props} />}
      </div>
    </div>
  );
}

function Summary({ a, data, catalog, show }: TabProps & { data: ResultData; catalog: Catalog | null; show: (t: InsightTab) => void }) {
  const s = a.score;
  const withinReach = a.recoverable.rushedPenalty + a.recoverable.changedAwayFromRight;
  const losses = [
    s.blankMarks && `${s.blankMarks} on questions left blank`,
    s.wrongMarks && `${s.wrongMarks} on wrong answers`,
    s.penalty && `${s.penalty} more to negative marking`,
  ].filter(Boolean);
  const subject = data.test.subject && isSubjectId(data.test.subject) ? data.test.subject : null;
  const exam = data.test.exam && isExamSlug(data.test.exam) ? EXAMS[data.test.exam] : null;
  const tests = catalog?.tests ?? [];
  const nextTest = tests.find(
    (t) => t.exam === data.test.exam && (t.subject ?? null) === subject && t.testNumber === (data.test.testNumber ?? 0) + 1,
  );
  const otherFree = tests.filter((t) => t.testId !== data.test.testId && t.access === "free" && !t.latestAttempt);
  const elapsed = data.attempt.submittedAt ? new Date(data.attempt.submittedAt).getTime() - new Date(data.attempt.startedAt).getTime() : null;

  return (
    <>
      <dl className="rx-tiles">
        <div>
          <dt>Accuracy</dt>
          <dd>{s.attempted ? `${s.accuracy}%` : "–"}</dd>
          <p>
            {s.correct} right of {s.attempted} answered
          </p>
        </div>
        <div>
          <dt>Attempted</dt>
          <dd>{s.attemptRate}%</dd>
          <p>
            {s.attempted} of {s.total} questions
          </p>
        </div>
        <div>
          <dt>Negative marking</dt>
          <dd>{s.penaltyExam ? `−${s.penalty}` : "None"}</dd>
          <p>{s.penaltyExam ? `from ${plural(s.wrong, "wrong answer")}` : "this exam has no negative marks"}</p>
        </div>
        <div>
          <dt>Time used</dt>
          <dd>{a.time.recorded ? fmtMin(a.time.usedMs) : elapsed !== null ? fmtMin(Math.min(elapsed, a.time.durationMs)) : "–"}</dd>
          <p>
            of {fmtMin(a.time.durationMs)}
            {a.time.recorded ? "" : " (per-question time not recorded)"}
          </p>
        </div>
      </dl>

      <Figure
        id="rx-score"
        title="From the maximum to your score"
        takeaway={`You kept ${s.score} of ${s.max} marks${losses.length ? `, losing ${losses.join(", ")}` : ""}.`}
        table={
          <table className="rx-table-plain">
            <tbody>
              <tr>
                <th scope="row">Maximum{s.notCounted.length ? " (sections that count)" : ""}</th>
                <td>{s.max}</td>
              </tr>
              <tr>
                <th scope="row">Marks not earned on blank questions ({s.blank + s.notReached})</th>
                <td>−{s.blankMarks}</td>
              </tr>
              <tr>
                <th scope="row">Marks not earned on wrong answers ({s.wrong})</th>
                <td>−{s.wrongMarks}</td>
              </tr>
              {s.penaltyExam && (
                <tr>
                  <th scope="row">Negative marking</th>
                  <td>−{s.penalty}</td>
                </tr>
              )}
              <tr>
                <th scope="row">Your score</th>
                <td>{s.score}</td>
              </tr>
            </tbody>
          </table>
        }
      >
        <Waterfall
          label={`Waterfall: maximum ${s.max}, minus ${s.blankMarks} blank, minus ${s.wrongMarks} wrong${s.penaltyExam ? `, minus ${s.penalty} negative marking` : ""}, equals ${s.score}.`}
          steps={[
            { label: "Maximum", value: s.max, cls: "rx-o-max", total: true },
            { label: "Left blank", value: s.blankMarks, cls: "rx-o-blank" },
            { label: "Wrong answers", value: s.wrongMarks, cls: "rx-o-wrong" },
            ...(s.penaltyExam ? [{ label: "Negative marking", value: s.penalty, cls: "rx-o-penalty" }] : []),
            { label: "Your score", value: s.score, cls: "rx-o-correct", total: true },
          ]}
        />
        {s.notCounted.length > 0 && (
          <p className="rx-note">
            Only your best {data.sections.length - s.notCounted.length} sections count, as in the official exam. Not counted:{" "}
            {s.notCounted.join(", ")}.
          </p>
        )}
        {withinReach > 0 && (
          <p className="rx-callout">
            <strong>+{withinReach} marks were within reach without new study:</strong>{" "}
            {[
              a.recoverable.rushedPenalty && `${a.recoverable.rushedPenalty} lost to negative marks on rushed answers`,
              a.recoverable.changedAwayFromRight && `${a.recoverable.changedAwayFromRight} lost by changing right answers`,
            ]
              .filter(Boolean)
              .join("; ")}
            .
          </p>
        )}
      </Figure>

      {a.insights.length > 0 && (
        <section className="rx-plan" aria-labelledby="rx-plan-title">
          <h2 id="rx-plan-title">Your plan for the next test</h2>
          <p className="rx-takeaway">Ranked by how many marks each one is likely to be worth, from this attempt alone.</p>
          <ol>
            {a.insights.map((i) => (
              <li key={i.title} className={i.tone === "keep" ? "rx-keep" : undefined}>
                <strong>{i.title}</strong>
                <p>{i.detail}</p>
                {i.tab !== "summary" && (
                  <button type="button" className="student-text-button" onClick={() => show(i.tab)}>
                    See the evidence <ArrowRight size={15} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {a.sections.length > 1 && (
        <Figure
          id="rx-sections"
          title="Sections"
          takeaway={(() => {
            const best = [...a.sections].sort((x, y) => y.score - x.score)[0];
            const worst = [...a.sections].sort((x, y) => x.score - y.score)[0];
            return `${best.name} scored highest (${best.score}/${best.maxScore}); ${worst.name} lowest (${worst.score}/${worst.maxScore}).`;
          })()}
        >
          <HeatTable
            caption="Score, outcomes and time by section"
            columns={[
              { label: "Section" },
              { label: "Score" },
              { label: "Right", tone: "correct" },
              { label: "Wrong", tone: "wrong" },
              { label: "Blank", tone: "blank" },
              { label: "Accuracy" },
              { label: "Time / ideal" },
            ]}
            rows={a.sections.map((x) => ({
              key: x.id,
              head: (
                <>
                  {x.name}
                  {!x.counted && <small className="rx-sub">not counted</small>}
                </>
              ),
              cells: [
                { value: `${x.score}/${x.maxScore}` },
                { value: x.correct, share: x.correct / x.total },
                { value: x.wrong, share: x.wrong / x.total },
                { value: x.unanswered, share: x.unanswered / x.total },
                { value: x.accuracy === null ? "–" : `${x.accuracy}%` },
                { value: a.time.recorded ? `${fmt(x.timeMs)} / ${fmt(x.idealMs)}` : "not recorded" },
              ],
            }))}
          />
        </Figure>
      )}

      <section className="rx-next" aria-labelledby="rx-next-title">
        <h2 id="rx-next-title">Next step</h2>
        <div>
          {nextTest && nextTest.access !== "locked" && (
            <Link className="button-primary" href={`/student/tests/${nextTest.testId}`}>
              Take Test {nextTest.testNumber} <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
          {nextTest && nextTest.access === "locked" && exam && (
            <Link className="button-primary" href={`/test-series/${exam.slug}`}>
              Unlock Tests 2–{plannedTestsFor(exam.slug, data.test.subject)} <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
          {otherFree.slice(0, 3).map((t) => (
            <Link key={t.testId} className="student-secondary" href={`/student/tests/${t.testId}`}>
              Free {t.subject && isSubjectId(t.subject) ? SUBJECT_NAMES[t.subject] : t.title} test
            </Link>
          ))}
          <Link className="student-text-button" href="/student">
            All tests <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
