import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { estimateCrl, rankEstimates, bandFor, quotaEligible, predictColleges, STATES } from "../src/lib/predictors/jee.ts";
import { SUBMISSION_LIMITS } from "../src/lib/predictors/submissions.ts";

const data = JSON.parse(readFileSync(new URL("../src/data/predictors/jee/josaa-2026-final.json", import.meta.url), "utf8"));

describe("JEE Main percentile to rank", () => {
  it("applies rank ≈ (100 − P) × N / 100 + 1", () => {
    assert.equal(estimateCrl(98.5, 1_538_468), 23_078);
    assert.equal(estimateCrl(100, 1_538_468), 1);
    assert.equal(estimateCrl(0, 1000), 1001);
    assert.throws(() => estimateCrl(101, 1000));
    assert.throws(() => estimateCrl(Number.NaN, 1000));
  });
  it("gives one estimate per cohort, most recent first", () => {
    const [a, b] = rankEstimates(90);
    assert.equal(a.year, 2026);
    assert.ok(a.rank > b.rank);
  });
});

describe("JEE Main college predictor", () => {
  it("bands by rank ÷ closing rank", () => {
    assert.equal(bandFor(800, 1000), "likely");
    assert.equal(bandFor(1000, 1000), "borderline");
    assert.equal(bandFor(1200, 1000), "borderline");
    assert.equal(bandFor(1300, 1000), "reach");
    assert.equal(bandFor(1301, 1000), null);
  });

  it("applies home-state rules", () => {
    const nitDelhi = { name: "NIT Delhi", type: "NIT", homeStates: ["Delhi", "Chandigarh"] };
    assert.ok(quotaEligible("HS", nitDelhi, "Chandigarh"));
    assert.ok(!quotaEligible("OS", nitDelhi, "Chandigarh"));
    assert.ok(quotaEligible("OS", nitDelhi, "Outside India"));
    assert.ok(!quotaEligible("HS", nitDelhi, "Outside India"));
    const srinagar = { name: "NIT Srinagar", type: "NIT", homeStates: ["Jammu and Kashmir", "Ladakh"] };
    assert.ok(quotaEligible("LA", srinagar, "Ladakh") && !quotaEligible("JK", srinagar, "Ladakh"));
    assert.ok(quotaEligible("AI", { name: "x", type: "IIIT" }, "Kerala"));
  });

  it("dataset is complete, official-shaped and excludes IITs", () => {
    assert.equal(data.meta.rows, data.rows.length);
    assert.equal(data.meta.byType.NIT, 32);
    assert.equal(data.meta.byType.IIIT, 26);
    assert.ok(!data.institutes.some((i) => /^Indian Institute\s+of Technology\b/.test(i.name)), "IITs need JEE Advanced");
    assert.ok(!data.programs.some((p) => /Bachelor of (Architecture|Planning)/.test(p)), "Paper 2 programmes use a different rank list");
    for (const r of data.rows) {
      assert.ok(r[5] >= 1 && r[6] >= r[5], "opening ≤ closing");
      assert.ok(["AI", "HS", "OS", "GO", "JK", "LA"].includes(r[2]));
      assert.ok(["OPEN", "EWS", "OBC-NCL", "SC", "ST"].includes(r[3]));
    }
    for (const inst of data.institutes)
      for (const s of inst.homeStates ?? []) assert.ok(STATES.includes(s), `${inst.name}: unknown state ${s}`);
  });

  it("matches OPEN seats on CRL and category seats on category rank, gender pools respected", () => {
    const male = predictColleges(data, { crl: 20000, category: "OBC-NCL", categoryRank: 5000, gender: "male", homeState: "Kerala" });
    assert.ok(male.length > 0);
    assert.ok(male.every((p) => p.pool === "Gender-neutral"));
    assert.ok(male.every((p) => (p.seatType === "OPEN" ? p.rankUsed === 20000 : p.rankUsed === 5000)));
    assert.ok(male.every((p) => p.seatType === "OPEN" || p.seatType === "OBC-NCL"));
    assert.ok(!male.some((p) => p.quota === "HS" && !p.institute.includes("Calicut")));
    const female = predictColleges(data, { crl: 20000, category: "OPEN", gender: "female", homeState: "Kerala" });
    assert.ok(female.some((p) => p.pool === "Female-only"));
    // Without a category rank only OPEN seats are matched.
    const noCat = predictColleges(data, { crl: 20000, category: "SC", gender: "male", homeState: "Kerala" });
    assert.ok(noCat.every((p) => p.seatType === "OPEN"));
  });
});

describe("tool submissions", () => {
  it("keeps inputs small", () => {
    assert.ok(SUBMISSION_LIMITS.maxInputBytes <= 2048);
  });
});
