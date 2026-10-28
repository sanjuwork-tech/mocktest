import { Check, Minus } from "lucide-react";

type Cell = "yes" | "varies" | "no" | string;

// A comparison with *types* of platforms, not named companies: individual providers differ, and we
// only state what we can stand behind. Update if a row stops being true for OurMocks.
const COLUMNS = ["OurMocks", "Large test-series portals", "Free government portals", "Exam information websites"];

const ROWS: { feature: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { feature: "CUET UG, IISER IAT, NISER NEST and COMEDK in one place", cells: ["yes", "varies", "varies", "yes"] },
  { feature: "Full-length mocks on each exam's official pattern and marking (including NEST's best-three-sections rule)", cells: ["yes", "varies", "varies", "no"] },
  { feature: "Questions reviewed by subject matter experts, PhD scholars and university professors", cells: ["yes", "varies", "varies", "no"] },
  { feature: "Free full-length Test 1 for every exam we cover", cells: ["yes", "varies", "varies", "no"] },
  { feature: "Time-per-question analysis: rushed, slow and time-sink questions against the ideal pace", cells: ["yes", "varies", "varies", "no"] },
  { feature: "Personalised analysis across all your tests: topic mastery, answer changes and a plan for the next test", cells: ["yes", "varies", "varies", "no"] },
  { feature: "Section and topic analysis with worked solutions", cells: ["yes", "yes", "varies", "no"] },
  { feature: "No invented ranks or percentiles in your report", cells: ["yes", "varies", "varies", "no"] },
  { feature: "Syllabus, official past papers and score calculators for all four exams", cells: ["yes", "varies", "varies", "varies"] },
];

function Value({ cell }: { cell: Cell }) {
  if (cell === "yes")
    return (
      <span className="cmp-yes">
        <Check size={16} aria-hidden="true" /> Yes
      </span>
    );
  if (cell === "no")
    return (
      <span className="cmp-no">
        <Minus size={16} aria-hidden="true" /> No
      </span>
    );
  return <span className="cmp-varies">{cell === "varies" ? "Varies" : cell}</span>;
}

export function ComparePlatforms() {
  return (
    <section className="compare-platforms" aria-labelledby="compare-platforms-title">
      <p className="eyebrow">Why OurMocks</p>
      <h2 id="compare-platforms-title">What you get here, side by side</h2>
      <p className="section-copy">
        A general comparison with the kinds of platforms students usually use, based on publicly available information.
        Individual providers differ — check any platform you&apos;re considering.
      </p>
      <div className="table-scroll">
        <table className="cmp-table">
          <caption className="sr-only">OurMocks compared with common types of preparation platforms</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {COLUMNS.map((c, i) => (
                <th scope="col" key={c} className={i === 0 ? "cmp-us" : undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                {row.cells.map((cell, i) => (
                  <td key={i} className={i === 0 ? "cmp-us" : undefined}>
                    <Value cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="review-note">Comparison reviewed October 2026.</p>
    </section>
  );
}
