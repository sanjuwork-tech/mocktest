import { OUTCOME_LABEL, QUALITY_LABEL } from "@/lib/analysis";
import type { TabProps } from "../result-view";
import { Columns, Figure, Legend, LinePlot, StackRows, Strip } from "./charts";
import { fmt, fmtMin, plural } from "./format";

const OUTCOME_LEGEND = (["correct", "wrong", "blank", "not-reached"] as const).map((o) => ({ cls: `rx-o-${o}`, label: OUTCOME_LABEL[o] }));

export function TimeTab({ a, label, jump }: TabProps) {
  const t = a.time;
  if (!t.recorded)
    return (
      <p className="rx-callout">
        Time per question was not recorded for this attempt, so pacing charts aren&apos;t available. Your score, topics, decisions and answers are in
        the other tabs.
      </p>
    );

  const qs = a.questions;
  const n = qs.length;
  const min = (ms: number) => ms / 60000;
  const last = a.pace.points[n - 1];
  const yMax = Math.max(t.durationMs, last.cumMs, last.idealMs) * 1.05;
  const behind = a.pace.maxBehind && a.pace.maxBehind.ms >= t.targetMs ? a.pace.maxBehind : null;
  const cap = Math.max(t.targetMs * 2, t.p90Ms * 1.15);
  const slowOnes = qs.filter((q) => q.timeMs > t.targetMs * 1.5).length;
  const checkpoints = [...new Set([0.25, 0.5, 0.75, 1].map((f) => Math.max(0, Math.ceil(n * f) - 1)))];
  const sectionTicks = a.pace.sectionStarts.map((s) => ({ at: s.index, label: s.name }));

  const answered = (o: "correct" | "wrong") => qs.filter((q) => q.outcome === o && q.timeMs > 0);
  const blanks = qs.filter((q) => q.outcome === "blank");
  const dot = (q: (typeof qs)[number]) => ({ value: q.timeMs, title: `${label(q.index)}: ${fmt(q.timeMs)}, ${QUALITY_LABEL[q.quality]}` });
  const qd = a.quadrants;
  const quadrantRows = [
    { name: "Fast and right", count: qd.fastRight, meaning: "Secure: keep doing this." },
    { name: "Slow and right", count: qd.slowRight, meaning: "You know it but it costs time: practise for speed." },
    { name: "Fast and wrong", count: qd.fastWrong, meaning: "Careless slip or guess: read every option first." },
    { name: "Slow and wrong", count: qd.slowWrong, meaning: "Concept gap: revise the topic, then redo the question." },
  ];
  const worst = qd.slowWrong + qd.fastWrong ? (qd.fastWrong >= qd.slowWrong ? quadrantRows[2] : quadrantRows[3]) : null;

  return (
    <>
      <Figure
        id="rx-pace"
        title="Pace across the paper"
        takeaway={`${
          behind
            ? `You were furthest behind at ${label(behind.index)}: ${fmtMin(behind.ms)} over the ideal pace by then.`
            : "You stayed on or ahead of the ideal pace across the paper."
        } You used ${fmtMin(t.usedMs)} of ${fmtMin(t.durationMs)}.`}
        table={
          <table className="rx-table-plain">
            <thead>
              <tr>
                <th scope="col">Up to</th>
                <th scope="col">Your time</th>
                <th scope="col">Ideal</th>
                <th scope="col">Difference</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map((i) => {
                const p = a.pace.points[i];
                const d = p.cumMs - p.idealMs;
                return (
                  <tr key={i}>
                    <th scope="row">{label(i)}</th>
                    <td>{fmt(p.cumMs)}</td>
                    <td>{fmt(p.idealMs)}</td>
                    <td>{d > 0 ? `${fmt(d)} behind` : `${fmt(-d)} ahead`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }
      >
        <LinePlot
          label={`Cumulative time in paper order against the ideal pace of ${fmt(t.targetMs)} per question. Total ${fmtMin(t.usedMs)}.`}
          series={[
            { cls: "rx-s-ideal", values: [0, ...a.pace.points.map((p) => min(p.idealMs))] },
            { cls: "rx-s-you", values: [0, ...a.pace.points.map((p) => min(p.cumMs))] },
          ]}
          yMax={min(yMax)}
          yTicks={[
            { at: 0, label: "0" },
            { at: min(t.durationMs), label: `${fmtMin(t.durationMs)} limit` },
          ]}
          xTicks={
            sectionTicks.length > 1
              ? sectionTicks
              : [
                  { at: 0, label: "Start" },
                  { at: n, label: label(n - 1) },
                ]
          }
          marks={
            behind
              ? [{ i: behind.index + 1, value: min(a.pace.points[behind.index].cumMs), label: `${label(behind.index)}: +${fmtMin(behind.ms)}` }]
              : []
          }
        />
        <Legend
          items={[
            { cls: "rx-s-you", label: "Your time so far" },
            { cls: "rx-s-ideal", label: `Ideal pace (${fmt(t.targetMs)} a question)` },
          ]}
        />
        <p className="rx-note">Time is added up in question order. You can move around the paper, so read this as where the time went, not when.</p>
      </Figure>

      <Figure
        id="rx-bars"
        title="Time on every question"
        takeaway={`Your median was ${fmt(t.medianMs)} a question against an ideal ${fmt(t.targetMs)}; ${plural(slowOnes, "question")} took over 1.5× the ideal.`}
        table={
          <table className="rx-table-plain">
            <thead>
              <tr>
                <th scope="col">Question</th>
                <th scope="col">Outcome</th>
                <th scope="col">Time</th>
                <th scope="col">Visits</th>
              </tr>
            </thead>
            <tbody>
              {qs.map((q) => (
                <tr key={q.index}>
                  <th scope="row">
                    <button type="button" className="rx-link" onClick={() => jump(q.index)}>
                      {label(q.index)}
                    </button>
                  </th>
                  <td>{QUALITY_LABEL[q.quality]}</td>
                  <td>{fmt(q.timeMs)}</td>
                  <td>{q.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <Columns
          label={`Bar chart of time on each of ${n} questions, coloured by outcome, with the ideal pace line at ${fmt(t.targetMs)}.`}
          bars={qs.map((q) => ({
            value: q.timeMs,
            cls: `rx-o-${q.outcome}`,
            title: `${label(q.index)}: ${fmt(q.timeMs)}, ${QUALITY_LABEL[q.quality]}`,
          }))}
          cap={cap}
          refs={[{ at: t.targetMs, label: `ideal ${fmt(t.targetMs)}` }]}
          groups={sectionTicks}
        />
        <Legend items={OUTCOME_LEGEND} />
      </Figure>

      <Figure
        id="rx-dist"
        title="Where your time went"
        takeaway={`Your ${plural(t.slowest.count, "slowest question")} (the slowest 10%) took ${t.slowest.share}% of your time and returned ${t.slowest.correct} correct.`}
        table={
          <table className="rx-table-plain">
            <thead>
              <tr>
                <th scope="col">Time per question</th>
                <th scope="col">Right</th>
                <th scope="col">Wrong</th>
                <th scope="col">Blank</th>
              </tr>
            </thead>
            <tbody>
              {t.buckets.map((b) => (
                <tr key={b.fromMs}>
                  <th scope="row">{b.toMs === null ? `Over ${fmt(b.fromMs)}` : `${fmt(b.fromMs)} to ${fmt(b.toMs)}`}</th>
                  <td>{b.correct}</td>
                  <td>{b.wrong}</td>
                  <td>{b.blank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <dl className="rx-tiles rx-tiles-small">
          <div>
            <dt>Median</dt>
            <dd>{fmt(t.medianMs)}</dd>
          </div>
          <div>
            <dt>Slowest 10% from</dt>
            <dd>{fmt(t.p90Ms)}</dd>
          </div>
          <div>
            <dt>Average, right answers</dt>
            <dd>{fmt(t.correct.avgMs)}</dd>
          </div>
          <div>
            <dt>Average, wrong answers</dt>
            <dd>{t.wrong.count ? fmt(t.wrong.avgMs) : "–"}</dd>
          </div>
        </dl>
        <StackRows
          label="Questions grouped by time spent, split by outcome."
          max={Math.max(...t.buckets.map((b) => b.correct + b.wrong + b.blank))}
          rows={t.buckets.map((b, i) => ({
            label: b.toMs === null ? `Over ${fmt(b.fromMs)}` : i === 0 ? `Under ${fmt(b.toMs)} (rushed)` : `${fmt(b.fromMs)}–${fmt(b.toMs)}`,
            total: b.correct + b.wrong + b.blank,
            parts: [
              { cls: "rx-o-correct", value: b.correct, name: "Right" },
              { cls: "rx-o-wrong", value: b.wrong, name: "Wrong" },
              { cls: "rx-o-blank", value: b.blank, name: "Blank" },
            ],
          }))}
        />
        <Legend items={OUTCOME_LEGEND.slice(0, 3)} />
        {a.timeSinks.length > 0 && (
          <>
            <h4 className="rx-h4">Time sinks: over 1.5× the ideal with no mark</h4>
            <ul className="rx-sinks">
              {a.timeSinks.map((s) => (
                <li key={s.index}>
                  <button type="button" className="rx-link" onClick={() => jump(s.index)}>
                    {label(s.index)}
                  </button>
                  <span>{s.topics.join(", ") || "General"}</span>
                  <strong>{fmt(s.timeMs)}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </Figure>

      <Figure
        id="rx-speed"
        title="Speed and accuracy"
        takeaway={
          worst ? `${worst.name} is your biggest leak (${worst.count}). ${worst.meaning}` : "Every answer you gave was right. Now work on speed."
        }
        table={
          <table className="rx-table-plain">
            <thead>
              <tr>
                <th scope="col">Group</th>
                <th scope="col">Questions</th>
                <th scope="col">What it means</th>
              </tr>
            </thead>
            <tbody>
              {quadrantRows.map((r) => (
                <tr key={r.name}>
                  <th scope="row">{r.name}</th>
                  <td>{r.count}</td>
                  <td>{r.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <Strip
          label={`Each answer placed by time. Split at the ideal pace of ${fmt(t.targetMs)}: ${quadrantRows.map((r) => `${r.name.toLowerCase()} ${r.count}`).join(", ")}.`}
          cap={cap}
          split={t.targetMs}
          ticks={[
            { at: 0, label: "0s" },
            { at: t.targetMs, label: `ideal ${fmt(t.targetMs)}` },
            { at: cap, label: `${fmt(cap)}+` },
          ]}
          rows={[
            {
              label: "Right",
              cls: "rx-o-correct",
              left: `Fast and right ${qd.fastRight}`,
              right: `Slow and right ${qd.slowRight}`,
              dots: answered("correct").map(dot),
            },
            {
              label: "Wrong",
              cls: "rx-o-wrong",
              left: `Slip or guess ${qd.fastWrong}`,
              right: `Concept gap ${qd.slowWrong}`,
              dots: answered("wrong").map(dot),
            },
            {
              label: "Blank",
              cls: "rx-o-blank",
              left: `Skipped quickly ${a.qualities.skipped}`,
              right: `Long, then skipped ${a.qualities["time-sink-skip"]}`,
              dots: blanks.map(dot),
            },
          ]}
        />
        <Legend items={OUTCOME_LEGEND.slice(0, 3)} />
      </Figure>
    </>
  );
}
