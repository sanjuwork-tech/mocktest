import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/catalog";
import { NEET_2026, NEET_2026_ANCHORS, estimateRank, type RankEstimate } from "@/lib/predictors/neet";
import { NeetPredictorForm } from "./neet-predictor-form";
import "./neet-predictor.css";

const PATH = "/tools/neet-rank-predictor";

export const metadata = pageMetadata(
  "NEET Rank Predictor from Marks (2026 data)",
  "Estimate your NEET UG All India Rank from your marks, using NTA's official 2026 score counts and cut-offs. Shown as a range, with the method and sources.",
  PATH,
  ["NEET rank predictor", "NEET marks vs rank", "NEET UG rank estimate", "NEET 2027 rank"],
);

const n = (x: number) => x.toLocaleString("en-IN");

const FAQS = [
  {
    q: "How accurate is this NEET rank estimate?",
    a: "It is exact only at the published anchor scores (for example, 10,160 candidates scored 600 or more in 2026). Between anchors we show the full possible range and a rough middle value. Your real 2027 rank also depends on how hard the 2027 paper is, which nobody knows in advance.",
  },
  {
    q: "Does NTA publish a NEET marks vs rank table?",
    a: "No. NTA publishes the number of candidates who appeared and qualified, category cut-off scores with their percentiles, topper lists and a few score counts in its result press release. It does not publish a full marks-to-rank table, so any exact-looking table online is someone's own estimate.",
  },
  {
    q: "What were the NEET UG 2026 qualifying marks?",
    a: "General and EWS: 213 (50th percentile). OBC, SC and ST: 177 (40th percentile). General-PwBD: 194 (45th percentile). OBC, SC and ST PwBD: 177. Source: NTA key data points, July 2026.",
  },
  {
    q: "How many students wrote NEET UG 2026?",
    a: "19,99,895 candidates appeared in the re-examination on 21 June 2026 and 11,21,185 qualified, according to NTA's result press release of 16 July 2026.",
  },
  {
    q: "Why can the same marks give a very different rank next year?",
    a: "Ranks depend on how everyone else scores. In 2025 the 50th percentile score was 144; in 2026 it was 213. A harder paper pushes everyone's marks down, so the same marks earn a better rank. Treat any estimate as a guide for planning, not a promise.",
  },
];

function ResultCard({ est }: { est: RankEstimate | null }) {
  if (!est) {
    return (
      <section id="result" tabIndex={-1} className="neetp-result neetp-result-empty" aria-live="polite">
        <p className="eyebrow">Your estimate</p>
        <p>Enter your marks to see the rank range they matched in NEET UG 2026.</p>
      </section>
    );
  }
  if (est.kind === "invalid") {
    return (
      <section id="result" tabIndex={-1} className="neetp-result neetp-result-empty" aria-live="polite">
        <p className="eyebrow">Check your marks</p>
        <p>{est.message}</p>
      </section>
    );
  }
  if (est.kind === "below-qualifying") {
    return (
      <section id="result" tabIndex={-1} className="neetp-result" aria-live="polite">
        <p className="eyebrow">Estimate for {est.marks} marks</p>
        <p className="neetp-big">Below the 2026 cut-off</p>
        <p>
          The lowest qualifying score in 2026 was {NEET_2026.lowestQualifying} (OBC, SC and ST, 40th percentile). NTA
          publishes no counts below it, so we do not estimate a rank here. Qualifying is the first step; it is worth
          finding out which chapters cost you the most marks.
        </p>
        <div className="neetp-links">
          <Link href="/free-diagnostic">Take the free diagnostic</Link>
        </div>
      </section>
    );
  }
  const exact = est.kind === "exact";
  return (
    <section id="result" tabIndex={-1} className="neetp-result" aria-live="polite">
      <p className="eyebrow">Estimate for {est.marks} marks, using 2026 data</p>
      <p className="neetp-big">
        AIR {n(est.best)} – {n(est.worst)}
        <small>
          {est.kind === "top"
            ? "At or above the 2026 top score."
            : exact
              ? `${n(est.worst)} candidates scored ${est.marks} or more in 2026.`
              : `Rough middle value: about ${n(est.central)}`}
        </small>
      </p>
      {est.kind === "range" && (
        <p>
          In 2026, {n(est.upper.count)} candidates scored {est.upper.marks} or more and{" "}
          {est.lower.approx ? "about " : ""}
          {n(est.lower.count)} scored {est.lower.marks} or more. With {est.marks} marks your rank would have been
          somewhere between those two numbers.
          {est.approx ? " One of these anchors is approximate (worked out from a percentile)." : ""}
        </p>
      )}
      <p>If the 2027 paper is easier, the same marks will give a worse rank; if it is harder, a better one.</p>
      <div className="neetp-links">
        <Link href={`/tools/neet-college-predictor?air=${est.central}&category=GN#result`}>
          See colleges near AIR {n(est.central)}
        </Link>
      </div>
    </section>
  );
}

export default async function NeetRankPredictorPage({
  searchParams,
}: {
  searchParams: Promise<{ marks?: string | string[] }>;
}) {
  const { marks } = await searchParams;
  const raw = Array.isArray(marks) ? marks[0] : marks;
  const est = raw !== undefined && raw !== "" ? estimateRank(Number(raw)) : null;
  const example = estimateRank(620);
  const url = `${siteConfig.url}${PATH}`;

  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "NEET UG rank estimator",
              url,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: 0, priceCurrency: "INR" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Free tools", item: `${siteConfig.url}/tools` },
                { "@type": "ListItem", position: 3, name: "NEET rank predictor", item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />
      <section className="guide-hero page-shell">
        <nav aria-label="Breadcrumb" className="exam-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/tools">Free tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">NEET rank predictor</span>
        </nav>
        <p className="eyebrow">Free tool · NEET UG</p>
        <h1>
          NEET rank
          <br />
          <em>predictor.</em>
        </h1>
        <p className="hero-copy">Your marks, placed on the official NEET UG 2026 results, with the working shown.</p>
      </section>

      <div className="page-shell section-space">
        <p className="neetp-summary">
          Enter your NEET UG marks out of 720 to see the All India Rank range that score matched in NEET UG 2026. We use
          only NTA&apos;s published numbers: score counts from the result press release and the category cut-offs. So you
          get an honest range with a rough middle value, not a falsely precise single rank.
        </p>

        <div className="neetp-layout">
          <NeetPredictorForm mode="rank" initial={{ marks: raw }} />
          <ResultCard est={est} />
        </div>

        <section className="neetp-section" aria-labelledby="neetp-how">
          <h2 id="neetp-how">How it works</h2>
          <ol>
            <li>
              NEET UG is one paper in one shift, so your rank is simply the number of candidates who scored more than
              you, plus one (NTA breaks ties using the tie-break rules in its bulletin).
            </li>
            <li>
              NTA does not publish a full marks-to-rank table. It does publish a few counts: how many candidates scored
              above certain marks, and how many qualified at each cut-off. Each count is an exact rank at that score.
              We call these anchors.
            </li>
            <li>
              For marks between two anchors, your rank must lie between the two counts. That range is the honest
              answer. We also show a rough middle value, found by drawing a smooth curve (straight on a log scale)
              between the anchors and rounding to two significant figures.
            </li>
            <li>
              Below 500 marks the anchors are far apart (500 and 213), so the range is wide. We would rather show you a
              wide true range than a narrow made-up one.
            </li>
          </ol>

          <h3 className="neetp-h3">The anchors we use (NEET UG 2026)</h3>
          <div className="neetp-table-wrap">
            <table className="neetp-table">
              <caption className="neetp-caption">Official NEET UG 2026 score counts used as anchors</caption>
              <thead>
                <tr>
                  <th scope="col" className="num">Marks or more</th>
                  <th scope="col" className="num">Candidates</th>
                  <th scope="col">Where the number comes from</th>
                </tr>
              </thead>
              <tbody>
                {NEET_2026_ANCHORS.map((a) => (
                  <tr key={a.marks}>
                    <td className="num">{a.marks}</td>
                    <td className="num">
                      {a.approx ? "≈ " : ""}
                      {n(a.count)}
                    </td>
                    <td>{a.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {example.kind === "range" && (
          <section className="neetp-section" aria-labelledby="neetp-example">
            <h2 id="neetp-example">Worked example: 620 marks</h2>
            <p>
              620 lies between two anchors: {n(example.upper.count)} candidates scored {example.upper.marks} or more,
              and {n(example.lower.count)} scored {example.lower.marks} or more. So in 2026, 620 marks meant an All India
              Rank between {n(example.best)} and {n(example.worst)}. 620 is 60% of the way from 650 down to 600; the
              same point on the log-scale curve gives a rough middle value of about {n(example.central)}.
            </p>
          </section>
        )}

        <section className="neetp-section" aria-labelledby="neetp-limits">
          <h2 id="neetp-limits">Limitations</h2>
          <ul>
            <li>
              This uses 2026 data. NEET UG 2026 was a re-examination held on 21 June 2026; 2027 may be harder or easier.
              The 50th percentile score was 144 in 2025 and 213 in 2026, so the same marks can mean very different
              ranks.
            </li>
            <li>
              The 194 and 177 anchors are approximate: NTA gives the percentile, not the exact count, so we use 55% and
              60% of the 19,99,895 candidates who appeared.
            </li>
            <li>The rough middle value is our curve, not NTA data. The range is what the data supports.</li>
            <li>This shows All India Rank, not your category rank or state merit rank.</li>
          </ul>
        </section>

        <section className="neetp-section" aria-labelledby="neetp-sources">
          <h2 id="neetp-sources">Sources (checked {NEET_2026.checkedOn})</h2>
          <ul>
            <li>
              <a href={NEET_2026.pressRelease} rel="noopener">
                NTA press release: NEET (UG) 2026 results, 16 July 2026
              </a>{" "}
              — score counts at 700, 690, 650, 600 and 500, highest score, candidates appeared.
            </li>
            <li>
              <a href={NEET_2026.keyData} rel="noopener">
                NTA: Key data points of NEET (UG) over years, July 2026
              </a>{" "}
              — appeared and qualified counts, category cut-off marks and percentiles for 2024–2026.
            </li>
          </ul>
        </section>

        <section className="neetp-section" aria-labelledby="neetp-next">
          <h2 id="neetp-next">Next steps</h2>
          <p>
            Have your rank? <Link href="/tools/neet-college-predictor">See which government MBBS and BDS colleges</Link>{" "}
            closed near it in MCC All India Quota counselling 2025. Many NEET aspirants also write the{" "}
            <Link href="/exams/iiser-iat">IISER Aptitude Test (IAT)</Link> and{" "}
            <Link href="/exams/niser-nest">NISER NEST</Link>, which both test Biology and lead to research-focused science
            degrees. Not sure where you stand? The <Link href="/free-diagnostic">free diagnostic</Link> shows your weak
            chapters.
          </p>
        </section>

        <section className="neetp-section exam-faqs" aria-labelledby="neetp-faq">
          <h2 id="neetp-faq">Frequently asked questions</h2>
          {FAQS.map((f) => (
            <div key={f.q} className="neetp-faq">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <p className="neetp-note">
          OurMocks is independent and not affiliated with NTA, MCC or NMC. These are estimates only; your official rank
          comes from NTA&apos;s scorecard at neet.nta.nic.in.
        </p>
      </div>
    </main>
  );
}
