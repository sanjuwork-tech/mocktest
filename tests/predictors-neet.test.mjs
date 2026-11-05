import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NEET_2026,
  NEET_2026_ANCHORS,
  bandFor,
  eligibleSeatCategories,
  estimateRank,
  parseCollegeQuery,
  predictColleges,
  roughRound,
} from "../src/lib/predictors/neet.ts";
import { AIQ_2025_META, AIQ_2025_ROWS } from "../src/data/predictors/neet/aiq-closing-ranks.ts";

describe("NEET marks -> rank", () => {
  it("anchors are ordered: fewer marks, more candidates", () => {
    for (let i = 1; i < NEET_2026_ANCHORS.length; i++) {
      assert.ok(NEET_2026_ANCHORS[i].marks < NEET_2026_ANCHORS[i - 1].marks);
      assert.ok(NEET_2026_ANCHORS[i].count > NEET_2026_ANCHORS[i - 1].count);
    }
    assert.ok(NEET_2026_ANCHORS.at(-1).count < NEET_2026.appeared);
    assert.equal(NEET_2026_ANCHORS.at(-1).marks, NEET_2026.lowestQualifying);
  });

  it("an anchor score returns the published count", () => {
    const e = estimateRank(600);
    assert.equal(e.kind, "exact");
    assert.equal(e.worst, 10_160);
    assert.equal(e.best, 1_493);
  });

  it("between anchors the rank is bounded by the two counts and the middle value sits inside", () => {
    const e = estimateRank(620);
    assert.equal(e.kind, "range");
    assert.equal(e.best, 1_493);
    assert.equal(e.worst, 10_160);
    assert.ok(e.central > e.best && e.central < e.worst);
    assert.equal(e.central, 4_700); // exp(ln1492 + 0.6·(ln10160 − ln1492)) ≈ 4,713 → 2 s.f.
  });

  it("more marks never give a worse rank", () => {
    let prev = 0;
    for (let m = 715; m >= 177; m--) {
      const e = estimateRank(m);
      assert.ok(e.central >= prev, `marks ${m}`);
      prev = e.central;
    }
  });

  it("handles the top, below cut-off and invalid input", () => {
    assert.equal(estimateRank(720).kind, "top");
    assert.equal(estimateRank(176).kind, "below-qualifying");
    assert.equal(estimateRank(-20).kind, "below-qualifying");
    assert.equal(estimateRank(721).kind, "invalid");
    assert.equal(estimateRank(612.5).kind, "invalid");
    assert.equal(estimateRank(Number.NaN).kind, "invalid");
  });

  it("rounds to two significant figures", () => {
    assert.equal(roughRound(4713), 4700);
    assert.equal(roughRound(87), 87);
    assert.equal(roughRound(123_456), 120_000);
  });
});

describe("NEET college bands", () => {
  const rows = [
    { college: "A", state: "X", course: "MBBS", quota: "All India", category: "Open", closingAir: 10_000, round: 3, allotments: 5 },
    { college: "A", state: "X", course: "MBBS", quota: "All India", category: "OBC", closingAir: 14_000, round: 3, allotments: 2 },
    { college: "B", state: "Y", course: "MBBS", quota: "All India", category: "SC", closingAir: 50_000, round: 2, allotments: 1 },
    { college: "C", state: "Z", course: "BDS", quota: "All India", category: "Open", closingAir: 30_000, round: 1, allotments: 3 },
  ];

  it("bands by ratio of AIR to closing rank", () => {
    assert.equal(bandFor(8_000, 10_000), "likely");
    assert.equal(bandFor(8_001, 10_000), "borderline");
    assert.equal(bandFor(10_000, 10_000), "borderline");
    assert.equal(bandFor(12_000, 10_000), "reach");
    assert.equal(bandFor(12_001, 10_000), null);
  });

  it("only open and own-category seats count, PwD seats only for PwD", () => {
    assert.deepEqual(eligibleSeatCategories("GN", false), ["Open"]);
    assert.deepEqual(eligibleSeatCategories("OBC", true), ["Open", "OBC", "Open PwD", "OBC PwD"]);
  });

  it("uses the best eligible seat type per college and respects course", () => {
    const obc = predictColleges(rows, { air: 13_000, category: "OBC", pwd: false, course: "any" });
    assert.deepEqual(obc.borderline.map((m) => m.category), ["OBC"]);
    assert.deepEqual(obc.likely.map((m) => m.college), ["C"]);
    const gn = predictColleges(rows, { air: 13_000, category: "GN", pwd: false, course: "MBBS" });
    assert.equal(gn.likely.length + gn.borderline.length + gn.reach.length, 0);
    const sc = predictColleges(rows, { air: 45_000, category: "SC", pwd: false, course: "MBBS" });
    assert.deepEqual(sc.borderline.map((m) => m.college), ["B"]);
  });

  it("parses and rejects query strings", () => {
    assert.deepEqual(parseCollegeQuery({ air: "25,000", category: "obc" }), { air: 25_000, category: "OBC", pwd: false, course: "any" });
    assert.equal(parseCollegeQuery({ air: "0", category: "GN" }), null);
    assert.equal(parseCollegeQuery({ air: "abc", category: "GN" }), null);
    assert.equal(parseCollegeQuery({ air: "100", category: "XYZ" }), null);
  });
});

describe("MCC AIQ 2025 dataset", () => {
  it("rows are complete, unique and cite official MCC result PDFs", () => {
    assert.ok(AIQ_2025_ROWS.length > 500, `only ${AIQ_2025_ROWS.length} rows`);
    assert.equal(AIQ_2025_ROWS.length, AIQ_2025_META.rows);
    const keys = new Set();
    for (const row of AIQ_2025_ROWS) {
      assert.ok(row.college.length > 3);
      assert.ok(["MBBS", "BDS"].includes(row.course));
      assert.ok(AIQ_2025_META.quotas.includes(row.quota), row.quota);
      assert.ok(Number.isInteger(row.closingAir) && row.closingAir > 0);
      assert.ok([1, 2, 3].includes(row.round));
      assert.ok(row.allotments >= 1);
      const key = `${row.college}|${row.course}|${row.quota}|${row.category}`;
      assert.ok(!keys.has(key), key);
      keys.add(key);
    }
    for (const round of Object.values(AIQ_2025_META.rounds)) {
      assert.match(round.url, /^https:\/\/cdnbbsr\.s3waas\.gov\.in\//);
    }
  });

  it("AIIMS New Delhi open MBBS closes at a very small rank", () => {
    const aiims = AIQ_2025_ROWS.find((r) => /AIIMS, New Delhi/i.test(r.college) && r.course === "MBBS" && r.category === "Open");
    assert.ok(aiims && aiims.closingAir < 200);
  });
});
