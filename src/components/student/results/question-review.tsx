"use client";
import { useEffect, useState } from "react";
import { Flag, RefreshCw } from "lucide-react";
import { ScientificRenderer } from "@/components/ui/scientific-renderer";
import { OUTCOME_LABEL } from "@/lib/analysis";
import type { ResultData, TabProps } from "../result-view";
import { OutcomeIcon } from "./charts";
import { fmt, signed } from "./format";

type Q = TabProps["a"]["questions"][number];
const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuestionReview({ a, data, focus, label }: TabProps & { data: ResultData; focus: number | null }) {
  const [filter, setFilter] = useState("all");
  // The question opened from a chart stays visible until the student picks a filter.
  const [pinned, setPinned] = useState(focus);
  const slowMs = a.time.targetMs * 1.5;
  const filters: [string, string, (q: Q) => boolean][] = [
    ["all", "All", () => true],
    ["wrong", "Wrong", (q) => q.outcome === "wrong"],
    ["blank", "Blank", (q) => !q.answered],
    ["slow", "Slow", (q) => q.timeMs > slowMs],
    ["changed", "Changed", (q) => q.changes > 0],
    ["marked", "Marked", (q) => q.marked],
  ];
  const active = filters.find(([id]) => id === filter) ?? filters[0];

  useEffect(() => {
    if (focus !== null) document.getElementById(`rq-${focus}`)?.scrollIntoView({ block: "start" });
  }, [focus]);

  return (
    <>
      <div className="rx-filters" role="group" aria-label="Show questions">
        {filters
          .filter(([id]) => id !== "slow" || a.time.recorded)
          .map(([id, name, test]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => {
                setFilter(id);
                setPinned(null);
              }}
            >
              {name} <span>{a.questions.filter(test).length}</span>
            </button>
          ))}
      </div>
      <ol className="rx-review">
        {a.questions.map((q) => {
          if (!active[2](q) && q.index !== pinned) return null;
          const paper = data.questions[q.index];
          return (
            <li key={q.index} id={`rq-${q.index}`}>
              <details open={q.index === focus}>
                <summary>
                  <strong>{label(q.index)}</strong>
                  <span className={`rx-outcome rx-outcome-${q.outcome}`}>
                    <OutcomeIcon outcome={q.outcome} /> {OUTCOME_LABEL[q.outcome]} {q.answered && signed(q.points)}
                  </span>
                  <span className="rx-sub">
                    {a.time.recorded ? fmt(q.timeMs) : "time not recorded"}
                    {a.time.recorded && q.timeMs > slowMs && " · slow"}
                  </span>
                  {q.changes > 0 && (
                    <span className="rx-sub">
                      <RefreshCw size={13} aria-hidden="true" /> changed {q.changes}×
                    </span>
                  )}
                  {q.marked && (
                    <span className="rx-sub">
                      <Flag size={13} aria-hidden="true" /> marked
                    </span>
                  )}
                  <span className="rx-sub rx-topics">
                    {q.topics.join(", ")}
                    {q.difficulty && ` · ${q.difficulty}`}
                  </span>
                </summary>
                <div className="rx-review-body">
                  <ScientificRenderer content={paper.content} />
                  <ul className="review-options">
                    {paper.options.map((o, j) => (
                      <li key={o.key} className={o.key === paper.correctOptionId ? "is-correct" : o.key === q.value ? "is-wrong" : undefined}>
                        <span className="option-letter">{LETTERS[j]}</span>
                        <ScientificRenderer content={o.content} />
                        {o.key === paper.correctOptionId && <small>Correct answer</small>}
                        {o.key === q.value && <small>Your answer</small>}
                        {q.changes > 0 && o.key === q.firstValue && o.key !== q.value && <small>Your first choice</small>}
                      </li>
                    ))}
                  </ul>
                  <div className="worked-explanation">
                    <strong>Worked solution</strong>
                    <ScientificRenderer content={paper.explanation} />
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </>
  );
}
