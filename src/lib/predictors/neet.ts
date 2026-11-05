// NEET UG estimates built only from official numbers. Pure functions, no data imports, so the client form,
// the server pages and tests can all use them. The college dataset lives server-side in
// src/data/predictors/neet/ and is passed in by the page; it never ships to the browser.

// ---------------------------------------------------------------------------------------------
// Marks -> All India Rank
// ---------------------------------------------------------------------------------------------

/** A published point on the NEET UG 2026 marks distribution: `count` candidates scored `marks` or more. */
export type MarksAnchor = {
  marks: number;
  count: number;
  /** true when the count is derived from a percentile (approximate), false when NTA printed the count. */
  approx: boolean;
  source: string;
};

export const NEET_2026 = {
  year: 2026,
  examDate: "2026-06-21",
  resultDate: "2026-07-16",
  appeared: 1_999_895,
  qualified: 1_121_185,
  maxMarks: 720,
  /** Lowest qualifying score for any category (40th percentile: OBC, SC, ST). */
  lowestQualifying: 177,
  pressRelease:
    "https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/07/20260716477215762.pdf",
  keyData:
    "https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/07/202607161539405935.pdf",
  checkedOn: "2026-11-05",
} as const;

const PR = "NTA press release, 16 July 2026";
const KD = "NTA, Key data points of NEET (UG) over years, table 8";

/**
 * Anchors, highest marks first. Each count is "candidates scoring at least `marks`". Strict ">" statements in
 * the press release are converted to ">=" by adding one mark (marks are whole numbers).
 * 194 and 177 are the 45th and 40th percentile cut-offs; NTA does not print how many scored at or above them,
 * so we use (100 − percentile)% of the 19,99,895 who appeared and mark them approximate.
 */
export const NEET_2026_ANCHORS: readonly MarksAnchor[] = [
  { marks: 715, count: 2, approx: false, source: `${PR}: highest score 715, obtained jointly by two candidates` },
  { marks: 706, count: 17, approx: false, source: `${PR}: top 17 rankers scored more than 705` },
  { marks: 701, count: 19, approx: false, source: `${PR}: 19 candidates scored above 700` },
  { marks: 691, count: 138, approx: false, source: `${PR}: 138 candidates scored above 690` },
  { marks: 650, count: 1_492, approx: false, source: `${PR}: 1,492 candidates scored 650 and above` },
  { marks: 600, count: 10_160, approx: false, source: `${PR}: 10,160 candidates scored 600 and above` },
  { marks: 500, count: 90_780, approx: false, source: `${PR}: 90,780 candidates scored 500 and above` },
  { marks: 213, count: 996_935, approx: false, source: `${KD}: 9,96,935 candidates in the 715–213 band (50th percentile)` },
  { marks: 194, count: 1_099_942, approx: true, source: `${KD}: 194 is the 45th percentile score; ≈55% of 19,99,895 appeared` },
  { marks: 177, count: 1_199_937, approx: true, source: `${KD}: 177 is the 40th percentile score; ≈60% of 19,99,895 appeared` },
];

export type RankEstimate =
  | { kind: "invalid"; message: string }
  | { kind: "top"; marks: number; best: number; worst: number; central: number }
  | {
      kind: "range";
      marks: number;
      /** Best and worst possible rank in 2026 given only the published anchors (monotonic bounds). */
      best: number;
      worst: number;
      /** Rough point estimate: straight-line interpolation of log(count) between the two anchors. */
      central: number;
      upper: MarksAnchor;
      lower: MarksAnchor;
      approx: boolean;
    }
  | { kind: "exact"; marks: number; best: number; worst: number; central: number; anchor: MarksAnchor }
  | { kind: "below-qualifying"; marks: number };

/** Round to two significant figures so the central estimate never looks more precise than it is. */
export function roughRound(n: number): number {
  if (n < 100) return Math.round(n);
  const p = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
}

/**
 * Estimate where `marks` would have placed a candidate in NEET UG 2026.
 * Uses only the anchors above; between two anchors the true rank must lie between their counts.
 */
export function estimateRank(marks: number, anchors: readonly MarksAnchor[] = NEET_2026_ANCHORS): RankEstimate {
  if (!Number.isInteger(marks) || marks < -180 || marks > 720) {
    return { kind: "invalid", message: "Enter whole marks between −180 and 720." };
  }
  const top = anchors[0];
  if (marks >= top.marks) return { kind: "top", marks, best: 1, worst: top.count, central: 1 };
  const last = anchors[anchors.length - 1];
  if (marks < last.marks) return { kind: "below-qualifying", marks };

  for (let i = 0; i < anchors.length - 1; i++) {
    const upper = anchors[i];
    const lower = anchors[i + 1];
    if (marks === lower.marks) {
      const best = upper.count + 1;
      return { kind: "exact", marks, best, worst: lower.count, central: lower.count, anchor: lower };
    }
    if (marks < upper.marks && marks > lower.marks) {
      const t = (upper.marks - marks) / (upper.marks - lower.marks);
      const logCount = Math.log(upper.count) + t * (Math.log(lower.count) - Math.log(upper.count));
      const best = upper.count + 1;
      const worst = lower.count;
      const central = Math.min(worst, Math.max(best, roughRound(Math.exp(logCount))));
      return { kind: "range", marks, best, worst, central, upper, lower, approx: upper.approx || lower.approx };
    }
  }
  // marks equal to an anchor that is not the lower edge of a band (only the top one, handled above)
  return { kind: "invalid", message: "Could not place these marks." };
}

// ---------------------------------------------------------------------------------------------
// AIR -> colleges (MCC All India Quota closing ranks)
// ---------------------------------------------------------------------------------------------

export const CANDIDATE_CATEGORIES = ["GN", "EWS", "OBC", "SC", "ST"] as const;
export type CandidateCategory = (typeof CANDIDATE_CATEGORIES)[number];
export const CATEGORY_LABELS: Record<CandidateCategory, string> = {
  GN: "General",
  EWS: "General-EWS",
  OBC: "OBC (Non-Creamy Layer, central list)",
  SC: "SC",
  ST: "ST",
};

/** Seat categories as MCC prints them in allotment results. */
export type SeatCategory =
  | "Open"
  | "EWS"
  | "OBC"
  | "SC"
  | "ST"
  | "Open PwD"
  | "EWS PwD"
  | "OBC PwD"
  | "SC PwD"
  | "ST PwD";

/** One closing-rank row: the highest AIR allotted this seat type in MCC's regular rounds. */
export type ClosingRow = {
  college: string;
  state: string;
  course: "MBBS" | "BDS";
  quota: string;
  category: SeatCategory;
  closingAir: number;
  /** Regular round (1–3) in which that highest AIR was allotted. */
  round: 1 | 2 | 3;
  /** How many allotments in rounds 1–3 this row is based on. */
  allotments: number;
};

/** Seat categories a candidate can be allotted: open seats plus their own category (and PwD seats if PwD). */
export function eligibleSeatCategories(category: CandidateCategory, pwd: boolean): SeatCategory[] {
  const own: SeatCategory | null = category === "GN" ? null : (category as SeatCategory);
  const list: SeatCategory[] = ["Open"];
  if (own) list.push(own);
  if (pwd) {
    list.push("Open PwD");
    if (own) list.push(`${own} PwD` as SeatCategory);
  }
  return list;
}

/**
 * Bands, relative to last year's closing AIR (C) for a seat:
 *   likely     – your AIR is at most 80% of C (a 20% cushion)
 *   borderline – your AIR is between 80% and 100% of C
 *   reach      – your AIR is up to 20% worse than C (closing ranks move between years)
 * The 20% is our rule of thumb, not an official figure; the pages say so.
 */
export const BAND_LIMITS = { likely: 0.8, borderline: 1.0, reach: 1.2 } as const;
export type Band = "likely" | "borderline" | "reach";

export function bandFor(air: number, closingAir: number): Band | null {
  const ratio = air / closingAir;
  if (ratio <= BAND_LIMITS.likely) return "likely";
  if (ratio <= BAND_LIMITS.borderline) return "borderline";
  if (ratio <= BAND_LIMITS.reach) return "reach";
  return null;
}

export type CollegeQuery = {
  air: number;
  category: CandidateCategory;
  pwd: boolean;
  course: "MBBS" | "BDS" | "any";
};

export type CollegeMatch = ClosingRow & { band: Band };
export type CollegeResult = Record<Band, CollegeMatch[]>;

export function parseCollegeQuery(params: Record<string, string | string[] | undefined>): CollegeQuery | null {
  const one = (k: string) => (Array.isArray(params[k]) ? params[k][0] : params[k]) ?? "";
  const airText = one("air").replace(/[,\s]/g, "");
  if (!/^\d{1,7}$/.test(airText)) return null;
  const air = Number(airText);
  if (air < 1 || air > NEET_2026.appeared) return null;
  const category = one("category").toUpperCase();
  if (!(CANDIDATE_CATEGORIES as readonly string[]).includes(category)) return null;
  const courseText = one("course").toUpperCase();
  const course = courseText === "MBBS" || courseText === "BDS" ? courseText : "any";
  return { air, category: category as CandidateCategory, pwd: one("pwd") === "1", course };
}

/** Group seats by band. For each college+course+quota only the most favourable eligible seat category is kept. */
export function predictColleges(rows: readonly ClosingRow[], q: CollegeQuery): CollegeResult {
  const allowed = new Set(eligibleSeatCategories(q.category, q.pwd));
  const best = new Map<string, ClosingRow>();
  for (const row of rows) {
    if (!allowed.has(row.category)) continue;
    if (q.course !== "any" && row.course !== q.course) continue;
    const key = `${row.college}|${row.course}|${row.quota}`;
    const prev = best.get(key);
    if (!prev || row.closingAir > prev.closingAir) best.set(key, row);
  }
  const result: CollegeResult = { likely: [], borderline: [], reach: [] };
  for (const row of best.values()) {
    const band = bandFor(q.air, row.closingAir);
    if (band) result[band].push({ ...row, band });
  }
  // Most competitive first: the seats you are closest to are the most useful to see.
  for (const band of Object.keys(result) as Band[]) result[band].sort((a, b) => a.closingAir - b.closingAir);
  return result;
}
