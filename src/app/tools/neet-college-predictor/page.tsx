import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/catalog";
import {
  BAND_LIMITS,
  CATEGORY_LABELS,
  parseCollegeQuery,
  predictColleges,
  type Band,
  type CollegeMatch,
  type CollegeQuery,
} from "@/lib/predictors/neet";
import { AIQ_2025_META, AIQ_2025_ROWS } from "@/data/predictors/neet/aiq-closing-ranks";
import { NeetPredictorForm } from "../neet-rank-predictor/neet-predictor-form";
import "../neet-rank-predictor/neet-predictor.css";

const PATH = "/tools/neet-college-predictor";
const SHOW = 40;

export const metadata = pageMetadata(
  "NEET College Predictor: MCC AIQ 2025 Ranks",
  "Check which government MBBS and BDS seats closed near your NEET AIR in MCC All India Quota counselling 2025, by category. Official data, method shown.",
  PATH,
  ["NEET college predictor", "MCC AIQ closing rank 2025", "NEET MBBS college by rank", "government MBBS cutoff AIR"],
);

const n = (x: number) => x.toLocaleString("en-IN");
const pct = (x: number) => `${Math.round(x * 100)}%`;
const r = AIQ_2025_META.rounds;

const FAQS = [
  {
    q: "What is the MCC All India Quota?",
    a: "15% of MBBS and BDS seats in state government colleges, plus all seats at AIIMS, JIPMER and some central and deemed institutions, are filled through counselling run by the Medical Counselling Committee (MCC) on your NEET All India Rank. The other 85% of state government seats are filled by each state's own counselling.",
  },
  {
    q: "What does closing rank mean here?",
    a: "For each college, course, quota and seat category, it is the highest All India Rank that MCC allotted that seat to in rounds 1, 2 or 3 of 2025 counselling. Some candidates allotted a seat did not join, so later rounds can go further.",
  },
  {
    q: "Is a college in the likely group certain?",
    a: "No. Closing ranks change every year with the number of seats, how many candidates apply and how they fill their choices. Likely only means your rank was comfortably inside last year's closing rank.",
  },
  {
    q: "Are state quota (85%) seats included?",
    a: "No. State quota counselling is run by each state with its own merit lists and domicile rules, and we have not checked that data. Use your state counselling authority's published closing ranks for those seats.",
  },
  {
    q: "Why are deemed universities and stray rounds left out?",
    a: "Deemed and paid seats have very different fees, and stray vacancy rounds fill a few leftover seats at unusual ranks. Including them would make the bands misleading, so this tool covers government All India Quota and open seats in the regular rounds only.",
  },
];

const BAND_TEXT: Record<Band, { title: string; text: string }> = {
  likely: {
    title: "Likely",
    text: `Your AIR is at most ${pct(BAND_LIMITS.likely)} of the 2025 closing rank — a cushion of ${pct(1 - BAND_LIMITS.likely)}.`,
  },
  borderline: {
    title: "Borderline",
    text: `Your AIR is between ${pct(BAND_LIMITS.likely)} and ${pct(BAND_LIMITS.borderline)} of the 2025 closing rank — it would just have made it.`,
  },
  reach: {
    title: "Reach",
    text: `Your AIR is up to ${pct(BAND_LIMITS.reach - 1)} worse than the 2025 closing rank — possible only if closing ranks move your way.`,
  },
};

function MatchTable({ rows }: { rows: CollegeMatch[] }) {
  return (
    <div className="neetp-table-wrap">
      <table className="neetp-table">
        <thead>
          <tr>
            <th scope="col">College</th>
            <th scope="col">State</th>
            <th scope="col">Course</th>
            <th scope="col">Quota · seat</th>
            <th scope="col" className="num">
              2025 closing AIR
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={`${m.college}|${m.course}|${m.quota}|${m.category}`}>
              <td>{m.college}</td>
              <td>{m.state || "—"}</td>
              <td>{m.course}</td>
              <td>
                {m.quota} · {m.category}
              </td>
              <td className="num">
                {n(m.closingAir)} <small>(R{m.round})</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Results({ q }: { q: CollegeQuery | null }) {
  if (!q) {
    return (
      <section id="result" tabIndex={-1} className="neetp-result neetp-result-empty" aria-live="polite">
        <p className="eyebrow">Your colleges</p>
        <p>Enter your All India Rank and category to see government MBBS and BDS seats that closed near it in 2025.</p>
      </section>
    );
  }
  const res = predictColleges(AIQ_2025_ROWS, q);
  const total = res.likely.length + res.borderline.length + res.reach.length;
  return (
    <section id="result" tabIndex={-1} className="neetp-result" aria-live="polite">
      <p className="eyebrow">
        AIR {n(q.air)} · {CATEGORY_LABELS[q.category]}
        {q.pwd ? " · PwBD" : ""} · {q.course === "any" ? "MBBS and BDS" : q.course}
      </p>
      <p className="neetp-big">
        {n(res.likely.length)} likely
        <small>
          {n(res.borderline.length)} borderline · {n(res.reach.length)} reach
        </small>
      </p>
      {total === 0 ? (
        <p>
          No government All India Quota seat in our 2025 data closed at or near this rank for your category. State quota
          seats, which are not covered here, may still be open to you; check your state counselling authority.
        </p>
      ) : (
        <p>Lists are below the form. Most competitive seats come first in each group.</p>
      )}
    </section>
  );
}

function BandLists({ q }: { q: CollegeQuery | null }) {
  if (!q) return null;
  const res = predictColleges(AIQ_2025_ROWS, q);
  return (
    <div className="neetp-bands">
      {(["likely", "borderline", "reach"] as Band[]).map((band) => (
        <section key={band} className="neetp-band" aria-labelledby={`band-${band}`}>
          <h3 id={`band-${band}`}>
            <span className={`neetp-pill neetp-pill-${band}`}>{BAND_TEXT[band].title}</span>
            {n(res[band].length)} seats
          </h3>
          <p>{BAND_TEXT[band].text}</p>
          {res[band].length > 0 ? (
            <>
              <MatchTable rows={res[band].slice(0, SHOW)} />
              {res[band].length > SHOW && (
                <p className="neetp-small">
                  Showing the {SHOW} most competitive of {n(res[band].length)}. Pick MBBS or BDS only to narrow the list.
                </p>
              )}
            </>
          ) : (
            <p className="neetp-small">None in this group.</p>
          )}
        </section>
      ))}
    </div>
  );
}

export default async function NeetCollegePredictorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = parseCollegeQuery(params);
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const example: CollegeQuery = { air: 25_000, category: "OBC", pwd: false, course: "MBBS" };
  const ex = predictColleges(AIQ_2025_ROWS, example);
  const exFirst = ex.likely[0] ?? ex.borderline[0];
  const url = `${siteConfig.url}${PATH}`;

  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "NEET UG college finder (MCC All India Quota)",
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
                { "@type": "ListItem", position: 3, name: "NEET college predictor", item: url },
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
          <span aria-current="page">NEET college predictor</span>
        </nav>
        <p className="eyebrow">Free tool · NEET UG</p>
        <h1>
          NEET college
          <br />
          <em>predictor.</em>
        </h1>
        <p className="hero-copy">Your All India Rank against MCC&apos;s official 2025 All India Quota allotments.</p>
      </section>

      <div className="page-shell section-space">
        <p className="neetp-summary">
          Enter your NEET UG All India Rank and category to see which government MBBS and BDS seats closed near it in MCC
          All India Quota counselling 2025. Every closing rank comes from MCC&apos;s published round results. We sort
          seats into likely, borderline and reach, and explain exactly how. State quota seats are not included.
        </p>

        <div className="neetp-layout">
          <NeetPredictorForm
            mode="college"
            initial={{ air: one("air"), category: one("category"), course: one("course"), pwd: one("pwd") === "1" }}
          />
          <Results q={q} />
        </div>
        <BandLists q={q} />

        <section className="neetp-section" aria-labelledby="neetp-how">
          <h2 id="neetp-how">How it works</h2>
          <ol>
            <li>
              MCC publishes a result PDF after every round, listing each candidate&apos;s AIR and the college, course,
              quota and seat category allotted. We read rounds 1, 2 and 3 of 2025 counselling.
            </li>
            <li>
              For each college, course, quota and seat category we keep the highest AIR allotted in any of those rounds:
              the closing rank.
            </li>
            <li>
              You can take Open seats and seats of your own category (General candidates take Open seats only). If you
              tick PwBD, Open-PwD and your category&apos;s PwD seats count too. For each college we use the seat type
              with the most favourable closing rank for you.
            </li>
            <li>
              We compare your AIR (A) with the closing rank (C): <strong>likely</strong> if A ≤{" "}
              {BAND_LIMITS.likely}×C, <strong>borderline</strong> if A ≤ C, <strong>reach</strong> if A ≤{" "}
              {BAND_LIMITS.reach}×C. The 20% margins are our own rule of thumb for year-to-year movement, not an MCC
              figure.
            </li>
          </ol>
        </section>

        {exFirst && (
          <section className="neetp-section" aria-labelledby="neetp-example">
            <h2 id="neetp-example">Worked example: AIR 25,000, OBC, MBBS</h2>
            <p>
              An OBC candidate can take Open or OBC seats. With AIR 25,000 there are {n(ex.likely.length)} likely,{" "}
              {n(ex.borderline.length)} borderline and {n(ex.reach.length)} reach MBBS seats in the 2025 data. The most
              competitive {exFirst.band} one is {exFirst.college} ({exFirst.quota}, {exFirst.category} seat), which closed at AIR{" "}
              {n(exFirst.closingAir)} in round {exFirst.round}: 25,000 is {pct(25_000 / exFirst.closingAir)} of that, so it is {exFirst.band}.
            </p>
          </section>
        )}

        <section className="neetp-section" aria-labelledby="neetp-limits">
          <h2 id="neetp-limits">Limitations</h2>
          <ul>
            <li>
              Data is one year (2025). Seat numbers, applicants and choices change, so 2026 and 2027 closing ranks will
              differ.
            </li>
            <li>
              Covers MCC quotas: {AIQ_2025_META.quotas.join(", ")}. Not covered: state quota (85%) seats, deemed and
              paid seats, NRI, ESI-insured, Delhi University, IP University, AMU, BHU, Jamia and other internal or
              minority quotas, and stray vacancy rounds.
            </li>
            <li>
              A seat type that was never allotted in rounds 1–3 has no closing rank and is not shown. Seat types with
              very few allotments (one or two seats) can have unusual closing ranks.
            </li>
            <li>
              College names and states are as printed in MCC&apos;s PDFs, lightly cleaned. A few colleges appear under
              two spellings. {AIQ_2025_META.excluded ? `${AIQ_2025_META.excluded}.` : ""}
            </li>
          </ul>
        </section>

        <section className="neetp-section" aria-labelledby="neetp-sources">
          <h2 id="neetp-sources">Sources (checked {AIQ_2025_META.checkedOn})</h2>
          <p>
            {n(AIQ_2025_META.rows)} closing ranks across {n(AIQ_2025_META.colleges)} colleges, from MCC (mcc.nic.in):
          </p>
          <ul>
            {(["1", "2", "3"] as const).map((k) => (
              <li key={k}>
                <a href={r[k].url} rel="noopener">
                  {r[k].title}
                </a>{" "}
                ({r[k].published})
              </li>
            ))}
          </ul>
        </section>

        <section className="neetp-section" aria-labelledby="neetp-next">
          <h2 id="neetp-next">Next steps</h2>
          <p>
            Don&apos;t know your AIR yet? <Link href="/tools/neet-rank-predictor">Estimate it from your marks</Link>.
            Keeping options open is wise: the <Link href="/exams/iiser-iat">IISER Aptitude Test</Link> and{" "}
            <Link href="/exams/niser-nest">NISER NEST</Link> both test Biology and lead to research-focused science
            degrees. The <Link href="/free-diagnostic">free diagnostic</Link> shows which chapters to work on.
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
          OurMocks is independent and not affiliated with NTA, MCC or NMC. These are estimates only; seats are allotted
          by MCC at mcc.nic.in.
        </p>
      </div>
    </main>
  );
}
