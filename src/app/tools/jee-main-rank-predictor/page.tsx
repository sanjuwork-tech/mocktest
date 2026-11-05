import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { ADVANCED_CUTOFFS, JEE_MAIN_COHORTS, estimateCrl, isValidPercentile, rankEstimates } from "@/lib/predictors/jee";
import { PredictorForm } from "./predictor-form";
import { UpdatesSignup } from "./updates-signup";
import { ToolFrame, type Faq } from "./tool-frame";

const PATH = "/tools/jee-main-rank-predictor";
const TOOL = "jee-main-rank-predictor";
const CHECKED = "2026-11-05";

export const metadata = pageMetadata(
  "JEE Main Rank Predictor from Percentile",
  "Estimate your JEE Main All-India rank from your percentile using NTA's official 2026 candidate count. Formula, worked example and limits shown.",
  PATH,
  ["JEE Main rank predictor", "JEE Main percentile to rank", "JEE Main 2026 rank vs percentile", "JEE Main CRL estimate"],
);

const [latest, previous] = JEE_MAIN_COHORTS;
const fmt = (n: number) => n.toLocaleString("en-IN");
const OBC_2026_APPEARED = 611_953; // NTA 2026 press release, category-wise appeared, OBC total

const SUMMARY = `Enter your JEE Main percentile to estimate your All-India (Common Rank List) rank. We use rank ≈ (100 − percentile) × candidates appeared ÷ 100 + 1, with NTA's official count of ${fmt(latest.appeared)} candidates who appeared in JEE Main ${latest.year} Paper 1. It is an estimate, not your NTA rank, and it does not estimate category ranks.`;

const FAQS: Faq[] = [
  {
    q: "How do I convert my JEE Main percentile into a rank?",
    a: `Subtract your percentile from 100, multiply by the number of candidates who appeared, divide by 100 and add 1. With NTA's ${latest.year} figure of ${fmt(latest.appeared)} candidates, 98.5 percentile works out to about rank ${fmt(estimateCrl(98.5, latest.appeared))}. NTA's own rank can differ a little.`,
  },
  {
    q: "Can I predict my rank from my marks?",
    a: "Not reliably. NTA does not publish a marks-to-percentile table, and the same marks give different percentiles in different shifts because each shift's percentile is worked out only among the candidates in that shift. That is why this tool asks for your percentile.",
  },
  {
    q: "Does this tool estimate my category rank?",
    a: `No. It estimates only the Common Rank List (CRL) rank. Category ranks are printed on your NTA scorecard. Candidates of each category are not spread evenly across percentiles, so scaling by the category's share (for example, ${fmt(OBC_2026_APPEARED)} of ${fmt(latest.appeared)} appeared candidates in ${latest.year} were OBC) would mislead you.`,
  },
  {
    q: "What percentile did I need to qualify for JEE Advanced 2026?",
    a: `NTA's 2026 cut-offs were ${ADVANCED_CUTOFFS.map((c) => `${c.category} ${c.y2026}`).join(", ")} percentile. Qualifying for JEE Advanced also depends on the number of seats and other conditions in the JEE Advanced brochure.`,
  },
  {
    q: "Is this my official JEE Main rank?",
    a: "No. Only NTA publishes official ranks, after Session 2 results, using the better of your two session scores and its tie-break rules. This is an independent estimate by OurMocks, which is not affiliated with NTA.",
  },
];

export default async function JeeMainRankPredictorPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const percentile = p !== undefined && p.trim() !== "" ? Number(p) : null;
  const valid = percentile !== null && isValidPercentile(percentile);
  const estimates = valid ? rankEstimates(percentile) : null;
  const example = estimateCrl(98.5, latest.appeared);

  return (
    <ToolFrame
      path={PATH}
      name="JEE Main rank predictor"
      title={
        <>
          JEE Main rank
          <br />
          <em>predictor.</em>
        </>
      }
      summary={SUMMARY}
      faqs={FAQS}
      dateModified={CHECKED}
    >
      <section className="jeep-card" aria-labelledby="jeep-form-title">
        <h2 id="jeep-form-title">Your percentile</h2>
        <PredictorForm tool={TOOL} action={PATH} recordKeys={["p"]} submitLabel="Estimate my rank">
          <label htmlFor="jeep-p">JEE Main percentile (NTA score), 0 to 100</label>
          <input
            id="jeep-p"
            name="p"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="any"
            required
            defaultValue={p ?? ""}
            aria-describedby="jeep-p-hint"
          />
          <p id="jeep-p-hint" className="jeep-small">
            Use the total percentile from your scorecard or your own estimate, e.g. 97.4512345.
          </p>
        </PredictorForm>
      </section>

      {percentile !== null && (
        <section id="results" className="jeep-card jeep-results" aria-labelledby="jeep-results-title" aria-live="polite">
          <h2 id="jeep-results-title">Your estimate</h2>
          {!valid || !estimates ? (
            <p role="alert">Enter a percentile between 0 and 100.</p>
          ) : (
            <>
              <p className="jeep-big">
                About <strong>{fmt(estimates[0].rank)}</strong>
                <span> CRL rank</span>
              </p>
              <p>
                At {percentile} percentile, about {fmt(estimates[0].rank - 1)} of the {fmt(latest.appeared)} candidates who
                appeared in JEE Main {latest.year} would be ahead of you. With {previous.year}&apos;s smaller field (
                {fmt(previous.appeared)}) the same percentile gives about {fmt(estimates[1].rank)} — a sense of how
                much the size of the year&apos;s field alone moves the number.
              </p>
              <p>
                <Link className="text-link" href={`/tools/jee-main-college-predictor?rank=${estimates[0].rank}#form`}>
                  See NITs, IIITs and GFTIs near this rank →
                </Link>
              </p>
              <UpdatesSignup tool={TOOL} inputs={{ p: percentile }} />
            </>
          )}
        </section>
      )}

      <section className="jeep-section" aria-labelledby="jeep-how">
        <h2 id="jeep-how">How the estimate works</h2>
        <p>
          NTA holds JEE Main Paper 1 in many shifts. Inside each shift, your percentile is 100 × (candidates in your shift
          with a raw score equal to or below yours) ÷ (candidates in your shift). The percentiles of all shifts are then
          merged into one list, and your better score of the two sessions counts. So roughly (100 − percentile)% of
          everyone who appeared scored above you.
        </p>
        <p className="jeep-formula">
          rank ≈ (100 − percentile) × N ÷ 100 + 1, where N = {fmt(latest.appeared)} (unique candidates who appeared in
          JEE Main {latest.year} Paper 1, either session)
        </p>
        <h3>Worked example</h3>
        <p>
          A student with 98.5 percentile: (100 − 98.5) × {fmt(latest.appeared)} ÷ 100 ={" "}
          {fmt(Math.round((1.5 * latest.appeared) / 100))}; add 1 for yourself, and the estimate is about rank{" "}
          {fmt(example)}.
        </p>
      </section>

      <section className="jeep-section" aria-labelledby="jeep-limits">
        <h2 id="jeep-limits">How far off can it be?</h2>
        <ul className="jeep-list">
          <li>
            Each percentile is computed within one shift, so merging shifts is not perfectly even. We have not measured this
            error, and NTA does not publish rank-by-percentile tables to check it against.
          </li>
          <li>
            If you are estimating for a future session, the number of candidates will change. Between {previous.year} and{" "}
            {latest.year} it grew from {fmt(previous.appeared)} to {fmt(latest.appeared)}, about{" "}
            {Math.round(((latest.appeared - previous.appeared) / previous.appeared) * 100)}%.
          </li>
          <li>Ties are broken by Mathematics, Physics and Chemistry scores, then accuracy, so equal percentiles can get different ranks.</li>
          <li>Only the Common Rank List is estimated. Category and PwD ranks are not.</li>
          <li>Marks are not accepted, because NTA publishes no marks-to-percentile table and it differs by shift.</li>
        </ul>
      </section>

      <section className="jeep-section" aria-labelledby="jeep-cutoffs">
        <h2 id="jeep-cutoffs">JEE Advanced qualifying percentiles</h2>
        <div className="jeep-table-wrap">
          <table className="jeep-table">
            <caption>Lowest NTA percentile that qualified, from NTA&apos;s result press releases</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">2026</th>
                <th scope="col">2025</th>
              </tr>
            </thead>
            <tbody>
              {ADVANCED_CUTOFFS.map((c) => (
                <tr key={c.category}>
                  <th scope="row">{c.category}</th>
                  <td>{c.y2026}</td>
                  <td>{c.y2025}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="jeep-section" aria-labelledby="jeep-sources">
        <h2 id="jeep-sources">Sources</h2>
        <ul className="jeep-list">
          {JEE_MAIN_COHORTS.map((c) => (
            <li key={c.year}>
              <a className="text-link" href={c.source} rel="noopener" target="_blank">
                NTA press release: JEE (Main) {c.year} Paper 1 result
              </a>{" "}
              ({c.sourceDate}) — {fmt(c.appeared)} unique candidates appeared; JEE Advanced cut-offs.
            </li>
          ))}
          <li>
            <a
              className="text-link"
              href="https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/10/202610241890224107.pdf"
              rel="noopener"
              target="_blank"
            >
              NTA JEE (Main) 2027 Information Bulletin
            </a>{" "}
            (October 2026) — Appendix IV, percentile normalisation; tie-break rules.
          </li>
        </ul>
        <p className="jeep-small">All checked on {CHECKED}.</p>
      </section>

      <section className="jeep-section jeep-cta" aria-labelledby="jeep-practice">
        <h2 id="jeep-practice">Practise for your other entrance exams</h2>
        <p>
          A rank estimate tells you where you stand; timed practice moves it. OurMocks does not offer JEE Main mocks, but if
          you are also taking CUET UG, IISER IAT, NEST or COMEDK, Test 1 of each is free with time-per-question analysis.
        </p>
        <Link className="button-primary" href="/free-diagnostic">
          Try a free mock test
        </Link>
      </section>
    </ToolFrame>
  );
}
