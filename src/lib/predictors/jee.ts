// JEE Main estimates built only from official numbers. Pure functions with no data imports, so the
// server pages, the client form and tests can all use them. The JoSAA dataset lives in
// src/data/predictors/jee/ and is passed in by the server page; it never ships to the browser.

// ---------------------------------------------------------------------------------------------
// Percentile → rank
// ---------------------------------------------------------------------------------------------

/**
 * Unique candidates who appeared in JEE Main Paper 1 (B.E./B.Tech.), either session.
 * NTA result press releases: 2026 (20 April 2026) and 2025 (18 April 2025), checked 2026-11-05.
 */
export const JEE_MAIN_COHORTS = [
  {
    year: 2026,
    appeared: 1_538_468,
    source:
      "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260420809492136.pdf",
    sourceDate: "2026-04-20",
  },
  {
    year: 2025,
    appeared: 1_475_103,
    source: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2025/04/2025041920.pdf",
    sourceDate: "2025-04-18",
  },
] as const;

/** JEE (Advanced) eligibility cut-offs (lowest NTA percentile) from the same press releases. */
export const ADVANCED_CUTOFFS = [
  { category: "General (UR)", y2026: 93.4123549, y2025: 93.1023262 },
  { category: "EWS", y2026: 82.4164528, y2025: 80.3830119 },
  { category: "OBC-NCL", y2026: 80.9232583, y2025: 79.4313582 },
  { category: "SC", y2026: 63.9172792, y2025: 61.1526933 },
  { category: "ST", y2026: 52.0174712, y2025: 47.9026465 },
] as const;

export function isValidPercentile(p: number) {
  return Number.isFinite(p) && p >= 0 && p <= 100;
}

/**
 * Common Rank List estimate: rank ≈ (100 − percentile) × appeared / 100 + 1.
 * A percentile is the share of a shift's candidates scoring at or below you, so roughly
 * (100 − P)% of all candidates are ahead of you.
 */
export function estimateCrl(percentile: number, appeared: number) {
  if (!isValidPercentile(percentile)) throw new RangeError("Percentile must be between 0 and 100.");
  return Math.round(((100 - percentile) * appeared) / 100) + 1;
}

export function rankEstimates(percentile: number) {
  return JEE_MAIN_COHORTS.map((c) => ({ year: c.year, appeared: c.appeared, rank: estimateCrl(percentile, c.appeared) }));
}

// ---------------------------------------------------------------------------------------------
// College predictor (JoSAA final-round closing ranks)
// ---------------------------------------------------------------------------------------------

export const CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"] as const;
export type Category = (typeof CATEGORIES)[number];
export type Gender = "male" | "female";
export type Quota = "AI" | "HS" | "OS" | "GO" | "JK" | "LA";

/** Code of eligibility = where you first appeared for Class 12. "Outside India" can only take OS/AI seats. */
export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Outside India",
] as const;

export type Institute = { name: string; type: "NIT" | "IIIT" | "GFTI"; homeStates?: string[]; homeStateAssumed?: boolean };
/** [institute, program, quota, seat type, female-only pool (1) or gender-neutral (0), opening, closing, previous-year closing] */
export type OrcrRow = [number, number, string, string, 0 | 1, number, number, number | null];
export type JosaaData = {
  meta: {
    year: number;
    round: number;
    roundDate: string;
    roundNote: string;
    source: string;
    compareYear: number;
    compareRound: number;
    compareSource: string;
    checkedOn: string;
    excluded: string;
    institutes: number;
    rows: number;
    byType: Record<string, number>;
    change: { matched: number; median: number; within10: number; within20: number; within30: number };
  };
  institutes: Institute[];
  programs: string[];
  rows: OrcrRow[];
};

/**
 * Bands, as your rank ÷ last closing rank. Between 2025 and 2026 the median closing rank moved about 10%,
 * and roughly three in four moved 20% or less (see meta.change), so ±20% is "could go either way".
 */
export const BANDS = { likely: 0.8, borderline: 1.2, reach: 1.3 } as const;
export type Band = "likely" | "borderline" | "reach";

export function bandFor(rank: number, closing: number): Band | null {
  const r = rank / closing;
  if (r <= BANDS.likely) return "likely";
  if (r <= BANDS.borderline) return "borderline";
  if (r <= BANDS.reach) return "reach";
  return null;
}

/** Which quotas of an institute a student can compete in, given their state of eligibility. */
export function quotaEligible(quota: string, institute: Institute, homeState: string) {
  const home = institute.homeStates ?? [];
  switch (quota) {
    case "AI":
      return true;
    case "OS":
      return !home.includes(homeState);
    case "HS":
    case "GO": // NIT Goa lists two home-state quotas (GO and HS); JoSAA shares them between Goa and the UTs it serves.
      return homeState !== "Outside India" && home.includes(homeState);
    case "JK":
      return homeState === "Jammu and Kashmir" && home.includes(homeState);
    case "LA":
      return homeState === "Ladakh" && home.includes(homeState);
    default:
      return false;
  }
}

export type PredictInput = {
  crl: number;
  category: Category;
  /** Category rank from the NTA scorecard; needed to match EWS/OBC-NCL/SC/ST seats. */
  categoryRank?: number;
  gender: Gender;
  homeState: string;
  type?: "NIT" | "IIIT" | "GFTI" | "all";
};

export type Prediction = {
  institute: string;
  instituteType: Institute["type"];
  program: string;
  quota: string;
  seatType: string;
  pool: "Gender-neutral" | "Female-only";
  opening: number;
  closing: number;
  previousClosing: number | null;
  /** The rank compared with this row's closing rank: CRL for OPEN seats, category rank otherwise. */
  rankUsed: number;
  band: Band;
  homeStateAssumed: boolean;
};

export function validRank(n: number | undefined): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5_000_000;
}

export function predictColleges(data: JosaaData, input: PredictInput): Prediction[] {
  if (!validRank(input.crl)) throw new RangeError("Enter your rank as a whole number.");
  const out: Prediction[] = [];
  for (const [ii, pi, quota, seat, female, opening, closing, prev] of data.rows) {
    if (female && input.gender !== "female") continue;
    const rankUsed = seat === "OPEN" ? input.crl : seat === input.category ? input.categoryRank : undefined;
    if (!validRank(rankUsed)) continue;
    const inst = data.institutes[ii];
    if (input.type && input.type !== "all" && inst.type !== input.type) continue;
    if (!quotaEligible(quota, inst, input.homeState)) continue;
    const band = bandFor(rankUsed, closing);
    if (!band) continue;
    out.push({
      institute: inst.name,
      instituteType: inst.type,
      program: data.programs[pi],
      quota,
      seatType: seat,
      pool: female ? "Female-only" : "Gender-neutral",
      opening,
      closing,
      previousClosing: prev,
      rankUsed,
      band,
      homeStateAssumed: Boolean(inst.homeStateAssumed) && (quota === "HS" || quota === "OS"),
    });
  }
  // Most comfortable first within each band: lowest ratio of your rank to the closing rank.
  return out.sort((a, b) => a.rankUsed / a.closing - b.rankUsed / b.closing);
}
