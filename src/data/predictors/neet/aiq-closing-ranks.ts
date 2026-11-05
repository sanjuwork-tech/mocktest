// Server-only loader for MCC NEET UG 2025 All India Quota closing ranks. The JSON is built from MCC's official
// allotment result PDFs (see meta.rounds for URLs) by taking, for each college + course + quota + seat category,
// the highest AIR allotted in regular rounds 1–3. Nothing is interpolated or filled in by hand.
import "server-only";
import data from "./mcc-aiq-2025.json" with { type: "json" };
import type { ClosingRow, SeatCategory } from "../../../lib/predictors/neet.ts";

type RoundMeta = { title: string; url: string; published: string };
type Raw = {
  meta: {
    year: number;
    title: string;
    checkedOn: string;
    quotas: string[];
    rounds: Record<"1" | "2" | "3", RoundMeta>;
    colleges: number;
    rows: number;
    excluded?: string;
  };
  rows: [string, string, "MBBS" | "BDS", string, SeatCategory, number, 1 | 2 | 3, number][];
};

const raw = data as unknown as Raw;

export const AIQ_2025_META = raw.meta;

export const AIQ_2025_ROWS: readonly ClosingRow[] = raw.rows.map(
  ([college, state, course, quota, category, closingAir, round, allotments]) => ({
    college,
    state,
    course,
    quota,
    category,
    closingAir,
    round,
    allotments,
  }),
);
