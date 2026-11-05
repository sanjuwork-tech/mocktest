import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import {
  BANDS,
  CATEGORIES,
  STATES,
  bandFor,
  predictColleges,
  validRank,
  type Band,
  type Category,
  type JosaaData,
  type Prediction,
} from "@/lib/predictors/jee";
import josaaJson from "@/data/predictors/jee/josaa-2026-final.json";
import { PredictorForm } from "../jee-main-rank-predictor/predictor-form";
import { UpdatesSignup } from "../jee-main-rank-predictor/updates-signup";
import { ToolFrame, type Faq } from "../jee-main-rank-predictor/tool-frame";

// Server-only: the dataset is read here and only matching rows are rendered, so the browser never downloads it.
const data = josaaJson as unknown as JosaaData;
const { meta } = data;

const PATH = "/tools/jee-main-college-predictor";
const TOOL = "jee-main-college-predictor";
const SHOW_PER_BAND = 60;

export const metadata = pageMetadata(
  "JEE Main College Predictor: NITs, IIITs",
  `Find NIT, IIIT and GFTI programmes near your JEE Main rank, using official JoSAA ${meta.year} final-round closing ranks. Method and limits shown.`,
  PATH,
  ["JEE Main college predictor", "NIT college predictor", "JoSAA closing rank 2026", "IIIT cutoff rank", "JEE Main rank vs college"],
);

const fmt = (n: number) => n.toLocaleString("en-IN");
const pct = (x: number) => `${Math.round(x * 100)}%`;
const shortProgram = (p: string) => p.replace(/\s*\((\d) Years?, /, " ($1-year ");

const SUMMARY = `Enter your JEE Main rank, category and home state to see NIT, IIIT and GFTI programmes whose JoSAA ${meta.year} final-round closing rank is near yours. Each programme is marked likely, borderline or reach using thresholds explained below. IITs are not included: they admit through JEE Advanced. Closing ranks change every year.`;

const FAQS: Faq[] = [
  {
    q: "Which colleges does this JEE Main college predictor cover?",
    a: `All ${meta.byType.NIT} NIT+ institutes (31 NITs and IIEST Shibpur), all ${meta.byType.IIIT} IIITs and ${meta.byType.GFTI} other government-funded technical institutes (GFTIs) in JoSAA ${meta.year}, using ${fmt(meta.rows)} official opening and closing ranks from Round ${meta.round}, the final JoSAA round. PwD seats, B.Arch and B.Planning are not covered.`,
  },
  {
    q: "Can I predict IIT admission from my JEE Main rank?",
    a: "No. IIT seats are allotted on JEE Advanced ranks, so JEE Main ranks say nothing about them. You need to qualify JEE Main for JEE Advanced, then sit JEE Advanced.",
  },
  {
    q: "Which rank should I enter?",
    a: "Your Common Rank List (CRL) rank, which is used for OPEN seats. If you are EWS, OBC-NCL, SC or ST, also enter your category rank from your NTA scorecard; JoSAA closing ranks for those seats are category ranks, not CRL ranks.",
  },
  {
    q: "What is the home state quota in NITs?",
    a: "NITs, IIEST Shibpur and PEC Chandigarh split seats into a home-state quota, for students whose state of eligibility (where they first took Class 12) is the institute's state, and an other-state quota for everyone else. States without an NIT are linked to one: Chandigarh to NIT Delhi, Andaman and Nicobar to NIT Puducherry, Lakshadweep and Dadra and Nagar Haveli and Daman and Diu to NIT Goa, Ladakh to NIT Srinagar.",
  },
  {
    q: "How accurate is this college predictor?",
    a: `It shows where last year's admissions ended, not this year's. Comparing ${meta.compareYear} with ${meta.year}, the median closing rank moved ${pct(meta.change.median)}, ${pct(meta.change.within20)} moved 20% or less, and ${pct(1 - meta.change.within30)} moved more than 30%. Seat matrices, choices and the number of candidates all change.`,
  },
];

type Params = { rank?: string; cat?: string; crank?: string; gender?: string; state?: string; type?: string };

function readInput(sp: Params) {
  if (!sp.rank) return null;
  const crl = Number(sp.rank);
  const category = (CATEGORIES as readonly string[]).includes(sp.cat ?? "") ? (sp.cat as Category) : "OPEN";
  const categoryRank = sp.crank ? Number(sp.crank) : undefined;
  const gender = sp.gender === "female" ? "female" : "male";
  const homeState = (STATES as readonly string[]).includes(sp.state ?? "") ? (sp.state as string) : null;
  const type = sp.type === "NIT" || sp.type === "IIIT" || sp.type === "GFTI" ? sp.type : "all";
  const errors: string[] = [];
  if (!validRank(crl)) errors.push("Enter your CRL rank as a whole number, 1 or more.");
  if (!homeState) errors.push("Choose the state where you first took Class 12.");
  if (categoryRank !== undefined && !validRank(categoryRank)) errors.push("Enter your category rank as a whole number, or leave it blank.");
  return { crl, category, categoryRank: validRank(categoryRank) ? categoryRank : undefined, gender, homeState: homeState ?? "", type, errors } as const;
}

const BAND_TEXT: Record<Band, { title: string; note: string }> = {
  likely: { title: "Likely", note: `Your rank is at most ${BANDS.likely}× last year's closing rank (20% or more inside it).` },
  borderline: { title: "Borderline", note: `Your rank is within 20% either side of last year's closing rank.` },
  reach: { title: "Reach", note: `Your rank is 20–30% beyond last year's closing rank. Possible only if closing ranks loosen.` },
};

const QUOTA: Record<string, string> = { AI: "All India", HS: "Home state", OS: "Other state", GO: "Home state (Goa pool)", JK: "Home state (J&K)", LA: "Home state (Ladakh)" };

function ResultList({ items }: { items: Prediction[] }) {
  return (
    <ol className="jeep-results-list">
      {items.map((r) => (
        <li key={`${r.institute}|${r.program}|${r.quota}|${r.seatType}|${r.pool}`}>
          <p className="jeep-inst">
            {r.institute} <span className="jeep-tag">{r.instituteType}</span>
          </p>
          <p className="jeep-prog">{shortProgram(r.program)}</p>
          <p className="jeep-meta">
            {QUOTA[r.quota] ?? r.quota} · {r.seatType} · {r.pool}
          </p>
          <p className="jeep-meta">
            {meta.year} closing rank <strong>{fmt(r.closing)}</strong> (opening {fmt(r.opening)})
            {r.previousClosing ? ` · ${meta.compareYear}: ${fmt(r.previousClosing)}` : ` · not offered in this form in ${meta.compareYear}`}
            {" · "}your {r.seatType === "OPEN" ? "CRL" : "category"} rank {fmt(r.rankUsed)}
          </p>
          {r.homeStateAssumed && (
            <p className="jeep-meta jeep-warn">
              JoSAA&apos;s rules give this institute home-state seats without naming the state; we assumed the campus state.
              Check with JoSAA.
            </p>
          )}
          {(r.quota === "GO" || (r.quota === "HS" && r.institute === "National Institute of Technology Goa")) && (
            <p className="jeep-meta jeep-warn">
              NIT Goa lists two home-state quotas (GO and HS) shared by Goa and nearby UTs; check which one applies to you.
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export default async function JeeMainCollegePredictorPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const input = readInput(sp);
  const results = input && input.errors.length === 0 ? predictColleges(data, input) : null;
  const byBand = (band: Band) => results?.filter((r) => r.band === band) ?? [];

  // Worked example from a real row: NIT Tiruchirappalli CSE, Other State, OPEN, gender-neutral.
  const trichy = data.institutes.findIndex((i) => i.name === "National Institute of Technology, Tiruchirappalli");
  const cse = data.programs.indexOf("Computer Science and Engineering (4 Years, Bachelor of Technology)");
  const exampleRow = data.rows.find((r) => r[0] === trichy && r[1] === cse && r[2] === "OS" && r[3] === "OPEN" && r[4] === 0);
  const exampleClose = exampleRow?.[6];

  return (
    <ToolFrame
      path={PATH}
      name="JEE Main college predictor"
      title={
        <>
          JEE Main college
          <br />
          <em>predictor.</em>
        </>
      }
      summary={SUMMARY}
      faqs={FAQS}
      dateModified={meta.checkedOn}
    >
      <section id="form" className="jeep-card" aria-labelledby="jeep-form-title">
        <h2 id="jeep-form-title">Your rank and details</h2>
        <PredictorForm tool={TOOL} action={PATH} recordKeys={["rank", "cat", "crank", "gender", "state", "type"]} submitLabel="Show colleges">
          <div className="jeep-grid">
            <div>
              <label htmlFor="jeep-rank">JEE Main CRL rank</label>
              <input id="jeep-rank" name="rank" type="number" inputMode="numeric" min={1} step={1} required defaultValue={sp.rank ?? ""} />
              <p className="jeep-small">
                Don&apos;t have it yet? <Link href="/tools/jee-main-rank-predictor">Estimate it from your percentile</Link>.
              </p>
            </div>
            <div>
              <label htmlFor="jeep-cat">Category</label>
              <select id="jeep-cat" name="cat" defaultValue={sp.cat ?? "OPEN"}>
                <option value="OPEN">General (OPEN)</option>
                <option value="EWS">GEN-EWS</option>
                <option value="OBC-NCL">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div>
              <label htmlFor="jeep-crank">Category rank (EWS, OBC-NCL, SC, ST)</label>
              <input id="jeep-crank" name="crank" type="number" inputMode="numeric" min={1} step={1} defaultValue={sp.crank ?? ""} aria-describedby="jeep-crank-hint" />
              <p id="jeep-crank-hint" className="jeep-small">
                From your NTA scorecard. Leave blank to see OPEN seats only.
              </p>
            </div>
            <div>
              <label htmlFor="jeep-state">State where you first took Class 12</label>
              <select id="jeep-state" name="state" required defaultValue={sp.state ?? ""}>
                <option value="" disabled>
                  Choose…
                </option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend>Seat pools you can apply for</legend>
              <label>
                <input type="radio" name="gender" value="male" defaultChecked={sp.gender !== "female"} /> Not female: gender-neutral seats only
              </label>
              <label>
                <input type="radio" name="gender" value="female" defaultChecked={sp.gender === "female"} /> Female: female-only and gender-neutral seats
              </label>
            </fieldset>
            <div>
              <label htmlFor="jeep-type">Institutes</label>
              <select id="jeep-type" name="type" defaultValue={sp.type ?? "all"}>
                <option value="all">NITs, IIITs and GFTIs</option>
                <option value="NIT">NITs and IIEST only</option>
                <option value="IIIT">IIITs only</option>
                <option value="GFTI">GFTIs only</option>
              </select>
            </div>
          </div>
        </PredictorForm>
      </section>

      {input && (
        <section id="results" className="jeep-card jeep-results" aria-labelledby="jeep-results-title">
          <h2 id="jeep-results-title">Programmes near your rank</h2>
          {input.errors.length > 0 ? (
            <ul role="alert" className="jeep-list">
              {input.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : (
            <>
              <p>
                {results!.length === 0
                  ? "No programme's closing rank is within 30% of your rank for these choices. Try “NITs, IIITs and GFTIs”, check your category rank, or look at CSAB special rounds."
                  : `${fmt(results!.length)} seat options matched, based on JoSAA ${meta.year} Round ${meta.round} closing ranks.`}
                {input.category !== "OPEN" && input.categoryRank === undefined && " Add your category rank to include " + input.category + " seats."}
              </p>
              {(["likely", "borderline", "reach"] as const).map((band) => {
                const items = byBand(band);
                if (items.length === 0) return null;
                return (
                  <details key={band} className={`jeep-band jeep-band-${band}`} open={band !== "reach"}>
                    <summary>
                      {BAND_TEXT[band].title} <span>({fmt(items.length)})</span>
                    </summary>
                    <p className="jeep-small">{BAND_TEXT[band].note}</p>
                    <ResultList items={items.slice(0, SHOW_PER_BAND)} />
                    {items.length > SHOW_PER_BAND && (
                      <p className="jeep-small">
                        Showing the first {SHOW_PER_BAND} of {fmt(items.length)}. Narrow the list with the Institutes filter.
                      </p>
                    )}
                  </details>
                );
              })}
              <UpdatesSignup
                tool={TOOL}
                inputs={{ rank: input.crl, cat: input.category, crank: input.categoryRank ?? null, gender: input.gender, state: input.homeState, type: input.type }}
              />
            </>
          )}
        </section>
      )}

      <section className="jeep-section" aria-labelledby="jeep-how">
        <h2 id="jeep-how">How the predictor works</h2>
        <ol className="jeep-list">
          <li>
            We take every NIT, IIIT and GFTI programme in JoSAA {meta.year} Round {meta.round} (the final JoSAA round) and its
            official opening and closing rank for each quota, category and gender pool.
          </li>
          <li>
            We keep the seats you can compete for: OPEN seats (compared with your CRL rank), seats of your own category
            (compared with your category rank), gender-neutral seats, plus female-only seats if you choose that pool, and the
            All India, home-state or other-state quota that fits the state where you first took Class 12.
          </li>
          <li>
            For each seat we divide your rank by last year&apos;s closing rank and band it:{" "}
            <strong>likely</strong> up to {BANDS.likely}, <strong>borderline</strong> above {BANDS.likely} up to{" "}
            {BANDS.borderline}, <strong>reach</strong> above {BANDS.borderline} up to {BANDS.reach}. Anything further is not
            shown.
          </li>
        </ol>
        <p>
          Why ±20%? We compared the {fmt(meta.change.matched)} seat rows offered in both years: from {meta.compareYear} to{" "}
          {meta.year} the median closing rank moved {pct(meta.change.median)}, {pct(meta.change.within10)} moved 10% or
          less, {pct(meta.change.within20)} moved 20% or less and {pct(meta.change.within30)} moved 30% or less. So a seat
          within 20% of your rank could go either way; small pools (female-only, home-state ST, new programmes) swing the
          most.
        </p>
        {exampleClose && (
          <>
            <h3>Worked example</h3>
            <p>
              NIT Tiruchirappalli, Computer Science and Engineering, Other State, OPEN, gender-neutral closed at rank{" "}
              {fmt(exampleClose)} in JoSAA {meta.year}. A student from outside Tamil Nadu with CRL rank{" "}
              {fmt(Math.round(exampleClose * 0.75))} gets a ratio of 0.75: <strong>{bandFor(Math.round(exampleClose * 0.75), exampleClose)}</strong>.
              At rank {fmt(Math.round(exampleClose * 1.1))} the ratio is 1.10: <strong>{bandFor(Math.round(exampleClose * 1.1), exampleClose)}</strong>. At
              rank {fmt(Math.round(exampleClose * 1.25))} it is 1.25: <strong>{bandFor(Math.round(exampleClose * 1.25), exampleClose)}</strong>.
            </p>
          </>
        )}
      </section>

      <section className="jeep-section" aria-labelledby="jeep-limits">
        <h2 id="jeep-limits">Limitations</h2>
        <ul className="jeep-list">
          <li>Closing ranks are last year&apos;s. Seat matrices, new programmes, the number of candidates and other students&apos; choices all change them.</li>
          <li>Closing ranks are on that year&apos;s JEE Main rank scale. A rank from a bigger or smaller field is not exactly comparable.</li>
          <li>IITs and IISc (JEE Advanced), PwD seats, and B.Arch/B.Planning (Paper 2 ranks) are not included.</li>
          <li>CSAB special rounds after JoSAA can close at higher ranks; they are not included.</li>
          <li>
            Home-state rules follow JoSAA&apos;s business rules. For a few GFTIs the rules list home-state seats without naming
            the state; those results are marked.
          </li>
          <li>Eligibility rules (Class 12 marks, nationality, documents) are not checked here.</li>
        </ul>
      </section>

      <section className="jeep-section" aria-labelledby="jeep-sources">
        <h2 id="jeep-sources">Sources</h2>
        <ul className="jeep-list">
          <li>
            <a className="text-link" href={meta.source} rel="noopener" target="_blank">
              JoSAA {meta.year} opening and closing ranks, Round {meta.round}
            </a>{" "}
            (round of {meta.roundDate}; downloaded {meta.checkedOn}).
          </li>
          <li>
            <a className="text-link" href={meta.compareSource} rel="noopener" target="_blank">
              JoSAA opening and closing ranks archive, {meta.compareYear} Round {meta.compareRound}
            </a>{" "}
            (final {meta.compareYear} round; downloaded {meta.checkedOn}).
          </li>
          <li>
            <a
              className="text-link"
              href="https://cdnbbsr.s3waas.gov.in/s313111c20aee51aeb480ecbd988cd8cc9/uploads/2026/06/20260601632081678.pdf"
              rel="noopener"
              target="_blank"
            >
              JoSAA Business Rules 2026
            </a>{" "}
            (1 June 2026) — quotas, rank lists, female-only pool.
          </li>
          <li>
            <a
              className="text-link"
              href="https://cdnbbsr.s3waas.gov.in/s313111c20aee51aeb480ecbd988cd8cc9/uploads/2026/06/202606011735423571.pdf"
              rel="noopener"
              target="_blank"
            >
              JoSAA 2026 schedule
            </a>{" "}
            — Round 5 is the final round.
          </li>
        </ul>
      </section>

      <section className="jeep-section jeep-cta" aria-labelledby="jeep-practice">
        <h2 id="jeep-practice">Keep your options open</h2>
        <p>
          Many engineering and science seats sit outside JoSAA. If you are also taking COMEDK UGET, IISER IAT, NEST or CUET
          UG, Test 1 of each OurMocks series is free, on the official pattern and marking.
        </p>
        <Link className="button-primary" href="/free-diagnostic">
          Try a free mock test
        </Link>
      </section>
    </ToolFrame>
  );
}
