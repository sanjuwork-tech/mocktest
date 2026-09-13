"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Question, Response } from "@/lib/student/model";
import { RichText } from "./rich-text";
export function QuestionContent({ question: q }: { question: Question }) {
  return (
    <>
      {q.passage && (
        <div className="question-passage">
          <strong>Read the passage</strong>
          <RichText text={q.passage} />
        </div>
      )}
      <div className="question-prompt">
        <RichText text={q.prompt} />
      </div>
      {q.graph && (
        <div className="question-graph">
          <p>
            {q.graph.yLabel} against {q.graph.xLabel}
          </p>
          <div style={{ height: 240, width: "100%", minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={q.graph.points}
                margin={{ top: 15, right: 25, bottom: 20, left: 10 }}
                accessibilityLayer
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  label={{
                    value: q.graph.xLabel,
                    position: "bottom",
                    offset: 0,
                  }}
                />
                <YAxis dataKey="y" />
                <Tooltip />
                <Line
                  type="linear"
                  dataKey="y"
                  name={q.graph.yLabel}
                  stroke="#1f5eff"
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <details>
            <summary>Read graph values as a table</summary>
            <table>
              <caption>
                {q.graph.yLabel} against {q.graph.xLabel}
              </caption>
              <thead>
                <tr>
                  <th>{q.graph.xLabel}</th>
                  <th>{q.graph.yLabel}</th>
                </tr>
              </thead>
              <tbody>
                {q.graph.points.map((p) => (
                  <tr key={p.x}>
                    <td>{p.x}</td>
                    <td>{p.y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}
    </>
  );
}
export function AnswerInput({
  question: q,
  response: r,
  onChange,
  disabled = false,
}: {
  question: Question;
  response?: Response;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}) {
  const value = r?.value ?? "";
  if (q.type === "integer" || q.type === "numerical")
    return (
      <label className="numeric-answer">
        Your answer{" "}
        <input
          aria-label="Your numerical answer"
          disabled={disabled}
          type="number"
          step={q.type === "integer" ? 1 : "any"}
          inputMode={q.type === "integer" ? "numeric" : "decimal"}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>
          {q.type === "integer"
            ? "Enter a whole number."
            : `Enter a number only. Accepted tolerance: ±${q.tolerance ?? 0}.`}{" "}
          Units are given in the question.
        </span>
      </label>
    );
  if (q.type === "match" || q.type === "ordering") {
    const items = q.type === "match" ? q.left! : q.options!;
    const choices = q.type === "match" ? q.right! : q.options!;
    const selected = Array.isArray(value)
      ? value
      : Array(items.length).fill("");
    return (
      <fieldset className="matching-options" disabled={disabled}>
        <legend>
          {q.type === "match"
            ? "Choose one match for every row. Use each option once."
            : "Choose an item for each position, from first to last. Use each once."}
        </legend>
        {items.map((item, i) => (
          <label key={i}>
            <span>
              {q.type === "match" ? (
                <RichText text={item} />
              ) : (
                <>Position {i + 1}</>
              )}
            </span>
            <select
              aria-label={
                q.type === "match" ? `Match row ${i + 1}` : `Position ${i + 1}`
              }
              value={selected[i] ?? ""}
              onChange={(e) => {
                const next = [...selected];
                next[i] = e.target.value;
                onChange(next);
              }}
            >
              <option value="">Choose…</option>
              {choices.map((text, j) => (
                <option key={j} value={String(j)}>
                  {String.fromCharCode(65 + j)}. {text.replaceAll("$", "")}
                </option>
              ))}
            </select>
          </label>
        ))}
        <div className="matching-key">
          {choices.map((text, i) => (
            <p key={i}>
              <strong>{String.fromCharCode(65 + i)}.</strong>{" "}
              <RichText text={text} />
            </p>
          ))}
        </div>
        {selected.filter(Boolean).length !==
          new Set(selected.filter(Boolean)).size && (
          <p className="student-warning" role="status">
            You have used an option more than once. Each item must have a
            different match.
          </p>
        )}
      </fieldset>
    );
  }
  return (
    <fieldset className="answer-options" disabled={disabled}>
      <legend>
        {q.type === "multiple"
          ? "Select all correct answers."
          : "Select one answer."}
      </legend>
      {q.options!.map((text, i) => {
        const selected = Array.isArray(value)
          ? value.includes(String(i))
          : value === String(i);
        return (
          <label key={i} className={selected ? "selected" : ""}>
            <input
              type={q.type === "multiple" ? "checkbox" : "radio"}
              name={`answer-${q.id}`}
              checked={selected}
              onChange={() =>
                onChange(
                  q.type === "multiple"
                    ? selected
                      ? (value as string[]).filter((x) => x !== String(i))
                      : [...(Array.isArray(value) ? value : []), String(i)]
                    : String(i),
                )
              }
            />
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            <RichText text={text} />
          </label>
        );
      })}
    </fieldset>
  );
}
export function answerText(q: Question, value: string | string[]) {
  if (q.type === "numerical" || q.type === "integer") return String(value);
  if (Array.isArray(value))
    return value
      .map((v, i) =>
        q.type === "match"
          ? `${q.left![i]} → ${q.right![Number(v)] ?? "Unselected"}`
          : (q.options![Number(v)] ?? "Unselected"),
      )
      .join(" · ");
  return q.options?.[Number(value)] ?? "Unanswered";
}
