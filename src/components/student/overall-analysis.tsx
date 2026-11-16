"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SUBJECT_NAMES, EXAMS, isSubjectId, isExamSlug } from "@/lib/exams/catalog";
import type { analyseOverall } from "@/lib/analysis";
import { api } from "./api";
import { StudentShell } from "./shell";
import { Figure, HeatTable, Legend, LinePlot, StackRows } from "./results/charts";
import { plural, signed } from "./results/format";

type Overall = ReturnType<typeof analyseOverall>;

const subjectLabel = (key: string) => (isSubjectId(key) ? SUBJECT_NAMES[key] : isExamSlug(key) ? EXAMS[key].shortName : key);
const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

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
          Choose a test <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    );

  const t = o.trend;
  const first = t[0];
  const last = t[t.length - 1];
  const tick = (i: number) => `T${i + 1}`;
  const xTicks = t.map((_, i) => ({ at: i, label: tick(i) }));
  const timed = t.filter((x) => x.pacePercent !== null);
  const lastTimed = timed.at(-1);
  const paceMax = Math.max(150, ...timed.map((x) => (x.pacePercent ?? 0) * 1.1));
  const grid = o.topicGrid;
  const gridIndex = (id: string) => t.findIndex((x) => x.attemptId === id);
  const persistentNames = new Set(o.persistent.map((p) => `${p.subject}:${p.name}`));
  const testCell = (x: (typeof t)[number], i: number) => (
    <>
      <Link href={`/student/results/${x.attemptId}`}>{tick(i)}</Link>
      <small className="rx-sub">
        {x.title} · {date(x.date)}
      </small>
    </>
  );

  return (
    <div className="rx">
      <header className="rx-head">
        <p className="rx-meta">Overall analysis · {plural(o.attempts, "test")}</p>
        <h1>{data.student.name.split(" ")[0]}&apos;s progress</h1>
      </header>

      <dl className="rx-tiles">
        <div>
          <dt>Latest score</dt>
          <dd>{last.percent}%</dd>
          <p>{last.title}</p>
        </div>
        <div>
          <dt>Best score</dt>
          <dd>{Math.max(...t.map((x) => x.percent))}%</dd>
          <p>across {plural(o.attempts, "test")}</p>
        </div>
        <div>
          <dt>Since your first test</dt>
          <dd>{o.change === null ? "–" : `${signed(o.change)} pts`}</dd>
          <p>{o.change === null ? "take a second test to see a change" : "percentage points of the maximum"}</p>
        </div>
        <div>
          <dt>Latest accuracy</dt>
          <dd>{last.accuracy}%</dd>
          <p>{last.attemptRate}% of questions attempted</p>
        </div>
      </dl>

      <Figure
        id="ov-trend"
        title="Score and accuracy across tests"
        takeaway={
          t.length > 1
            ? `Your score went from ${first.percent}% to ${last.percent}% of the maximum, and accuracy from ${first.accuracy}% to ${last.accuracy}%.`
            : `One test so far: ${last.percent}% of the maximum at ${last.accuracy}% accuracy. Your trend appears after the next one.`
        }
        table={
          <table className="rx-table-plain">
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Score</th>
                <th scope="col">% of max</th>
                <th scope="col">Accuracy</th>
                <th scope="col">Attempted</th>
              </tr>
            </thead>
            <tbody>
              {t.map((x, i) => (
                <tr key={x.attemptId}>
                  <th scope="row">{testCell(x, i)}</th>
                  <td>
                    {x.score}/{x.maxScore}
                  </td>
                  <td>{x.percent}%</td>
                  <td>{x.accuracy}%</td>
                  <td>{x.attemptRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <LinePlot
          label={`Score and accuracy by test, oldest first: ${t.map((x, i) => `${tick(i)} score ${x.percent}%, accuracy ${x.accuracy}%`).join("; ")}.`}
          series={[
            { cls: "rx-s-score", values: t.map((x) => Math.max(0, x.percent)) },
            { cls: "rx-s-acc", values: t.map((x) => x.accuracy) },
          ]}
          yMax={100}
          yTicks={[
            { at: 0, label: "0%" },
            { at: 50, label: "50%" },
            { at: 100, label: "100%" },
          ]}
          xTicks={xTicks}
          dots
        />
        <Legend
          items={[
            { cls: "rx-s-score", label: "Score, % of maximum" },
            { cls: "rx-s-acc", label: "Accuracy on answered questions" },
          ]}
        />
        <p className="rx-note">Tests from different exams are on one scale as a percentage of each paper&apos;s maximum.</p>
      </Figure>

      <Figure
        id="ov-pace"
        title="Pacing across tests"
        takeaway={
          lastTimed
            ? `In your latest timed test you spent ${lastTimed.pacePercent}% of the ideal time on each answered question${lastTimed.pacePercent! > 110 ? ": slower than the paper allows" : lastTimed.pacePercent! < 60 ? ": quick, so check for rushed mistakes" : ""}.`
            : "Time per question wasn't recorded for these tests yet. Your next test will show pacing here."
        }
        table={
          <table className="rx-table-plain">
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Time per answer vs ideal</th>
                <th scope="col">Time used</th>
                <th scope="col">Rushed and wrong</th>
                <th scope="col">Never opened</th>
              </tr>
            </thead>
            <tbody>
              {t.map((x, i) => (
                <tr key={x.attemptId}>
                  <th scope="row">{testCell(x, i)}</th>
                  <td>{x.pacePercent === null ? "not recorded" : `${x.pacePercent}%`}</td>
                  <td>{x.timeUsedPercent === null ? "not recorded" : `${x.timeUsedPercent}%`}</td>
                  <td>{x.timingRecorded ? x.rushedWrong : "–"}</td>
                  <td>{x.notReached}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        {timed.length > 0 && (
          <>
            <LinePlot
              label={`Average time per answered question as a share of the ideal pace, by test: ${t.map((x, i) => `${tick(i)} ${x.pacePercent === null ? "not recorded" : `${x.pacePercent}%`}`).join("; ")}.`}
              series={[
                { cls: "rx-s-ref", values: t.map(() => 100) },
                { cls: "rx-s-pace", values: t.map((x) => x.pacePercent) },
              ]}
              yMax={paceMax}
              yTicks={[
                { at: 0, label: "0%" },
                { at: 100, label: "100% = ideal pace" },
              ]}
              xTicks={xTicks}
              dots
            />
            <Legend
              items={[
                { cls: "rx-s-pace", label: "Your time per answered question" },
                { cls: "rx-s-ref", label: "Ideal pace" },
              ]}
            />
          </>
        )}
      </Figure>

      {grid.rows.length > 0 && (
        <Figure
          id="ov-topics"
          title="Topic mastery over time"
          takeaway={
            o.persistent.length
              ? `${o.persistent.map((p) => p.name).join(", ")} lost marks in every test that included ${o.persistent.length === 1 ? "it" : "them"}. That's a pattern, not bad luck.`
              : "No topic has lost marks in every test it appeared in. Darker cells show higher accuracy."
          }
        >
          <HeatTable
            caption="Accuracy by topic in each test; a dash means the test had no question on that topic"
            columns={[{ label: "Topic" }, ...grid.tests.map((g) => ({ label: tick(gridIndex(g.attemptId)), tone: "correct" }))]}
            rows={grid.rows.map((r) => ({
              key: `${r.subject}:${r.name}`,
              head: (
                <>
                  {r.name}
                  <small className="rx-sub">
                    {subjectLabel(r.subject)}
                    {persistentNames.has(`${r.subject}:${r.name}`) && " · weak every time"}
                  </small>
                </>
              ),
              cells: r.cells.map((c) =>
                c === null ? { value: "–" } : c.accuracy === null ? { value: "blank" } : { value: `${c.accuracy}%`, share: c.accuracy / 100 },
              ),
            }))}
          />
          <p className="rx-note">Accuracy counts only the questions you answered. Column headings match the tests in the score table above.</p>
        </Figure>
      )}

      {o.focus.length > 0 && (
        <Figure
          id="ov-focus"
          title="Where marks keep leaking"
          takeaway={`${o.focus[0].name} has cost you the most marks across your tests (${o.focus[0].marksLost}).`}
        >
          <StackRows
            label={`Marks lost by topic across all tests: ${o.focus.map((f) => `${f.name} ${f.marksLost}`).join(", ")}.`}
            max={o.focus[0].marksLost}
            rows={o.focus.map((f) => ({
              label: `${f.name} (${subjectLabel(f.subject)})`,
              total: `−${f.marksLost}`,
              parts: [{ cls: "rx-o-penalty", value: f.marksLost, name: "Marks lost" }],
            }))}
          />
          {o.mastered.length > 0 && (
            <p className="rx-note">Mastered (80%+ over at least four answers): {o.mastered.map((m) => `${m.name} ${m.accuracy}%`).join(", ")}.</p>
          )}
        </Figure>
      )}

      <dl className="rx-tiles">
        <div>
          <dt>Rushed and wrong</dt>
          <dd>{o.totals.rushedWrong}</dd>
          <p>answers under the rushed threshold that were wrong</p>
        </div>
        <div>
          <dt>Answer changes</dt>
          <dd>{signed(o.totals.changeNet)}</dd>
          <p>
            net marks: {o.totals.wrongToRight} fixed, {o.totals.rightToWrong} spoiled
          </p>
        </div>
        <div>
          <dt>Time sinks</dt>
          <dd>{o.totals.timeSinks}</dd>
          <p>questions over 1.5× the ideal time with no mark</p>
        </div>
        <div>
          <dt>Never opened</dt>
          <dd>{o.totals.notReached}</dd>
          <p>questions you didn&apos;t reach</p>
        </div>
      </dl>

      {o.plan.length > 0 && (
        <section className="rx-plan" aria-labelledby="ov-plan-title">
          <h2 id="ov-plan-title">Your plan for the next test</h2>
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
