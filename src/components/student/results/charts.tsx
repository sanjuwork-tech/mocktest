// Chart primitives for the results and overall analysis pages: plain HTML/CSS plus one SVG layer for
// lines, so they reflow at any width and render without JavaScript. Every chart sits in a <Figure> with a
// one-line takeaway and either a role="img" summary or a real table, and outcome colour always travels
// with a shape (solid / hatched / hollow) and a label.
import type { ReactNode } from "react";
import { Check, Minus, X } from "lucide-react";
import type { Outcome } from "@/lib/analysis";
import { clamp, signed, vars } from "./format";
import "./results.css";

export function OutcomeIcon({ outcome }: { outcome: Outcome }) {
  const Icon = outcome === "correct" ? Check : outcome === "wrong" ? X : Minus;
  return <Icon size={15} strokeWidth={2.5} aria-hidden="true" className={`rx-icon rx-icon-${outcome}`} />;
}

/** Swatches mirror the marks: `cls` is the same class the mark uses. */
export function Legend({ items }: { items: { cls: string; label: string }[] }) {
  return (
    <ul className="rx-legend">
      {items.map((i) => (
        <li key={i.label}>
          <i className={`rx-sw ${i.cls}`} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function Figure({
  id,
  title,
  takeaway,
  children,
  table,
}: {
  id: string;
  title: string;
  takeaway: ReactNode;
  children: ReactNode;
  table?: ReactNode;
}) {
  return (
    <figure className="rx-figure" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>{title}</h3>
      <p className="rx-takeaway">{takeaway}</p>
      {children}
      {table && (
        <details className="rx-table">
          <summary>Show the numbers</summary>
          <div className="rx-scroll" role="region" aria-label={`${title}, as a table`} tabIndex={0}>
            {table}
          </div>
        </details>
      )}
    </figure>
  );
}

/** Horizontal waterfall: totals run from zero, losses step down from the running total. */
export function Waterfall({ steps, label }: { steps: { label: string; value: number; cls: string; total?: boolean }[]; label: string }) {
  // Each step starts where the previous one left the running total.
  const rows = steps.reduce<((typeof steps)[number] & { a: number; b: number; run: number })[]>((acc, s) => {
    const run = acc.at(-1)?.run ?? 0;
    const [a, b] = s.total ? [Math.min(0, s.value), Math.max(0, s.value)] : [run - s.value, run];
    return [...acc, { ...s, a, b, run: s.total ? s.value : a }];
  }, []);
  const lo = Math.min(0, ...rows.map((r) => r.a));
  const span = Math.max(1, ...rows.map((r) => r.b)) - lo;
  return (
    <ol className="rx-wf" role="img" aria-label={label}>
      {rows.map((r) => (
        <li key={r.label} className={r.total ? "rx-wf-total" : undefined}>
          <span>{r.label}</span>
          <b className="rx-track">
            <i
              className={r.cls}
              style={vars({
                "--a": ((r.a - lo) / span) * 100,
                "--w": ((r.b - r.a) / span) * 100,
              })}
            />
          </b>
          <strong>{r.total ? r.value : r.value ? `−${r.value}` : "0"}</strong>
        </li>
      ))}
    </ol>
  );
}

type Tick = { at: number; label: string };

/** Index-based line chart. Null values break the line (for example, a test with no timing). */
export function LinePlot({
  series,
  yMax,
  yTicks,
  xTicks,
  marks = [],
  dots,
  label,
}: {
  series: { cls: string; values: (number | null)[] }[];
  yMax: number;
  yTicks: Tick[];
  xTicks: Tick[];
  marks?: { i: number; value: number; label: string }[];
  dots?: boolean;
  label: string;
}) {
  const n = Math.max(...series.map((s) => s.values.length));
  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - clamp((v / yMax) * 100);
  const runs = (values: (number | null)[]) =>
    values.reduce<string[][]>(
      (acc, v, i) => {
        if (v === null) acc.push([]);
        else acc[acc.length - 1].push(`${x(i)},${y(v)}`);
        return acc;
      },
      [[]],
    );
  return (
    <div className="rx-line" role="img" aria-label={label}>
      <div className="rx-line-plot">
        {yTicks.map((t) => (
          <span key={t.label} className="rx-ytick" style={vars({ "--y": y(t.at) })}>
            {t.label}
          </span>
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {series.map((s) =>
            runs(s.values).map((pts, k) =>
              pts.length > 1 ? <polyline key={`${s.cls}${k}`} className={s.cls} points={pts.join(" ")} vectorEffect="non-scaling-stroke" /> : null,
            ),
          )}
        </svg>
        {dots &&
          series.flatMap((s) =>
            s.values.map((v, i) =>
              v === null ? null : <i key={`${s.cls}${i}`} className={`rx-pt ${s.cls}`} style={vars({ "--x": x(i), "--y": y(v) })} />,
            ),
          )}
        {marks.map((m) => (
          <span key={m.label} className={`rx-mark${x(m.i) > 55 ? " rx-mark-left" : ""}`} style={vars({ "--x": x(m.i), "--y": y(m.value) })}>
            <em>{m.label}</em>
          </span>
        ))}
      </div>
      <div className="rx-xaxis">
        {xTicks.map((t) => (
          <span key={`${t.at}${t.label}`} className={x(t.at) > 90 ? "rx-end" : undefined} style={vars({ "--x": x(t.at) })}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** One thin column per item against a capped scale; anything above the cap gets a notch. */
export function Columns({
  bars,
  cap,
  refs,
  groups,
  label,
}: {
  bars: { value: number; cls: string; title: string }[];
  cap: number;
  refs: Tick[];
  groups: Tick[];
  label: string;
}) {
  return (
    <div className="rx-cols-wrap" role="img" aria-label={label}>
      <div className="rx-cols">
        {refs.map((r) => (
          <span key={r.label} className="rx-ref" style={vars({ "--y": clamp((r.at / cap) * 100) })}>
            <em>{r.label}</em>
          </span>
        ))}
        {bars.map((b, i) => (
          <i
            key={i}
            className={`${b.cls}${b.value > cap ? " rx-over" : ""}`}
            title={b.title}
            style={vars({ "--h": Math.max(1.5, clamp((b.value / cap) * 100)) })}
          />
        ))}
      </div>
      {groups.length > 1 && (
        <div className="rx-xaxis">
          {groups.map((g) => (
            <span key={g.label} style={vars({ "--x": (g.at / bars.length) * 100 })}>
              {g.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Horizontal stacked bars on one shared scale. */
export function StackRows({
  rows,
  max,
  label,
}: {
  rows: {
    label: string;
    total: ReactNode;
    parts: { cls: string; value: number; name: string }[];
  }[];
  max: number;
  label: string;
}) {
  return (
    <ul className="rx-stack" role="img" aria-label={label}>
      {rows.map((r) => (
        <li key={r.label}>
          <span>{r.label}</span>
          <b className="rx-track">
            {r.parts.map((p) =>
              p.value > 0 ? (
                <i key={p.name} className={p.cls} title={`${p.name}: ${p.value}`} style={vars({ "--w": (p.value / Math.max(1, max)) * 100 })} />
              ) : null,
            )}
          </b>
          <strong>{r.total}</strong>
        </li>
      ))}
    </ul>
  );
}

/** Bars from a central zero: gains to the right, losses to the left. */
export function DivergingRows({ rows, label }: { rows: { label: string; value: number; note: string }[]; label: string }) {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  return (
    <ul className="rx-div" role="img" aria-label={label}>
      {rows.map((r) => (
        <li key={r.label}>
          <span>
            {r.label} <small>{r.note}</small>
          </span>
          <b className="rx-track">
            {r.value !== 0 && <i className={r.value > 0 ? "rx-gain" : "rx-loss"} style={vars({ "--w": (Math.abs(r.value) / max) * 50 })} />}
          </b>
          <strong>{signed(r.value)}</strong>
        </li>
      ))}
    </ul>
  );
}

/** Rows of dots by time (x) with a split at the ideal pace; each row is an outcome with its own shape. */
export function Strip({
  rows,
  cap,
  split,
  ticks,
  label,
}: {
  rows: {
    label: string;
    cls: string;
    left: string;
    right: string;
    dots: { value: number; title: string }[];
  }[];
  cap: number;
  split: number;
  ticks: Tick[];
  label: string;
}) {
  const x = (v: number) => clamp((v / cap) * 100, 1, 99);
  return (
    <div className="rx-strip" role="img" aria-label={label} style={vars({ "--s": x(split) })}>
      {rows.map((r) => (
        <div key={r.label} className="rx-strip-row">
          <span className="rx-strip-label">{r.label}</span>
          <div className="rx-strip-band">
            <em className="rx-q-left">{r.left}</em>
            <em className="rx-q-right">{r.right}</em>
            {r.dots.map((d, i) => (
              // Deterministic jitter keeps overlapping dots apart without randomness between renders.
              <i key={i} className={`rx-dot ${r.cls}`} title={d.title} style={vars({ "--x": x(d.value), "--j": ((i * 3) % 7) - 3 })} />
            ))}
          </div>
        </div>
      ))}
      <div className="rx-xaxis rx-strip-axis">
        {ticks.map((t) => (
          <span key={t.label} className={x(t.at) > 90 ? "rx-end" : undefined} style={vars({ "--x": x(t.at) })}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A real table whose count cells are shaded by share of the row: the chart and its text alternative in one. */
export function HeatTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: { label: string; tone?: string }[];
  rows: {
    key: string;
    head: ReactNode;
    cells: { value: ReactNode; share?: number }[];
  }[];
}) {
  return (
    <>
      {columns.length > 4 && (
        <p className="rx-swipe" aria-hidden="true">
          Swipe the table sideways to see every column.
        </p>
      )}
      <div className="rx-scroll" role="region" aria-label={caption} tabIndex={0}>
        <table className="rx-heat">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label} scope="col">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.head}</th>
                {r.cells.map((c, i) => {
                  const tone = columns[i + 1]?.tone;
                  return (
                    <td
                      key={i}
                      className={tone && c.share !== undefined ? `rx-cell rx-t-${tone}` : undefined}
                      style={c.share !== undefined ? vars({ "--s": c.share }) : undefined}
                    >
                      {c.value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
