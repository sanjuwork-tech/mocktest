import type { AttemptAnalysis } from "@/lib/analysis";
import type { TabProps } from "../result-view";
import { Figure, HeatTable } from "./charts";
import { fmt } from "./format";

type Row = AttemptAnalysis["topics"][number];

const COLUMNS = (first: string, timed: boolean) => [
  { label: first },
  { label: "Right", tone: "correct" },
  { label: "Wrong", tone: "wrong" },
  { label: "Blank", tone: "blank" },
  { label: "Accuracy" },
  ...(timed ? [{ label: "Avg time" }] : []),
  { label: "Marks lost" },
];

const cells = (r: Row, timed: boolean) => [
  { value: r.correct, share: r.correct / r.total },
  { value: r.wrong, share: r.wrong / r.total },
  // Never-opened questions count as blank here; the review list separates them.
  { value: r.unanswered, share: r.unanswered / r.total },
  { value: r.accuracy === null ? "–" : `${r.accuracy}%` },
  ...(timed ? [{ value: fmt(r.avgMs) }] : []),
  { value: r.marksLost },
];

export function TopicsTab({ a }: TabProps) {
  const timed = a.time.recorded;
  const lossy = a.topics.filter((t) => t.marksLost > 0);
  const strongest = [...a.topics].filter((t) => t.wrong === 0 && t.correct > 0).sort((x, y) => y.correct - x.correct)[0];
  const diff = a.difficulty;
  const worstDiff = [...diff].filter((d) => d.accuracy !== null).sort((x, y) => (x.accuracy ?? 0) - (y.accuracy ?? 0))[0];

  return (
    <>
      <Figure
        id="rx-topics"
        title="Topics, by marks lost"
        takeaway={
          lossy[0]
            ? `${lossy[0].name} cost the most (${lossy[0].marksLost} marks)${strongest ? `; ${strongest.name} was clean (${strongest.correct} of ${strongest.total} right)` : ""}.`
            : "You lost no marks in any topic."
        }
      >
        <HeatTable
          caption="Outcomes by topic, sorted by marks lost"
          columns={COLUMNS("Topic", timed)}
          rows={a.topics.map((t) => ({ key: t.name, head: t.name, cells: cells(t, timed) }))}
        />
        <p className="rx-note">
          Darker cells hold a bigger share of that topic&apos;s questions. Marks lost counts what a correct answer would have earned, plus any
          negative marks.
        </p>
      </Figure>

      {diff.length > 0 && (
        <Figure
          id="rx-difficulty"
          title="Difficulty"
          takeaway={
            worstDiff
              ? `Your accuracy was lowest on ${worstDiff.name} questions (${worstDiff.accuracy}%)${diff.find((d) => d.name === "easy" && d.wrong > 0) ? ", and easy questions leaked marks" : ""}.`
              : "No difficulty had an answered question."
          }
        >
          <HeatTable
            caption="Outcomes by difficulty"
            columns={COLUMNS("Difficulty", timed)}
            rows={diff.map((d) => ({ key: d.name, head: <span className="rx-cap">{d.name}</span>, cells: cells(d, timed) }))}
          />
        </Figure>
      )}
    </>
  );
}
