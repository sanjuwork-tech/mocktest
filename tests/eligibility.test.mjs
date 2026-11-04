import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkEligibility } from "../src/lib/eligibility.ts";

const pcm = { passYear: "2027", subjects: ["physics", "chemistry", "mathematics", "english"], percent: 75, reserved: false, karnatakaReserved: false };

describe("eligibility checker", () => {
  it("a PCM student with 75% qualifies everywhere", () => {
    const r = checkEligibility(pcm);
    for (const exam of Object.keys(r)) assert.equal(r[exam].status, "eligible", exam);
  });

  it("applies the 60% / 55% aggregate for IAT and NEST", () => {
    assert.equal(checkEligibility({ ...pcm, percent: 57 })["iiser-iat"].status, "not-eligible");
    assert.equal(checkEligibility({ ...pcm, percent: 57, reserved: true })["niser-nest"].status, "eligible");
  });

  it("needs three of PCMB for IAT and NEST, and PME plus an optional for COMEDK", () => {
    const pcb = checkEligibility({ ...pcm, subjects: ["physics", "chemistry", "biology", "english"] });
    assert.equal(pcb["iiser-iat"].status, "eligible");
    assert.equal(pcb.comedk.status, "not-eligible");
    const commerce = checkEligibility({ ...pcm, subjects: ["mathematics", "english"] });
    assert.equal(commerce["niser-nest"].status, "not-eligible");
    assert.equal(commerce["cuet-ug"].status, "eligible");
  });

  it("limits IAT and NEST to recent passouts and leaves marks to check when not entered", () => {
    assert.equal(checkEligibility({ ...pcm, passYear: "earlier" })["iiser-iat"].status, "not-eligible");
    assert.equal(checkEligibility({ ...pcm, passYear: "earlier" }).comedk.status, "eligible");
    assert.equal(checkEligibility({ ...pcm, percent: null }).comedk.status, "check");
  });

  it("relaxes COMEDK to 40% for Karnataka SC/ST/OBC", () => {
    assert.equal(checkEligibility({ ...pcm, percent: 42 }).comedk.status, "not-eligible");
    assert.equal(checkEligibility({ ...pcm, percent: 42, karnatakaReserved: true }).comedk.status, "eligible");
  });
});
