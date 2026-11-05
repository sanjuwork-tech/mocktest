import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { consentRecord, POLICY_VERSION, signupConsentSchema } from "../src/app/privacy/legal.ts";

const parse = (value) => signupConsentSchema.safeParse(value);

describe("sign-up consent", () => {
  it("accepts an adult who agrees", () => {
    assert.ok(parse({ ageBasis: "adult", acceptTerms: true }).success);
  });

  it("requires agreement to the terms and an age choice", () => {
    assert.equal(parse({ ageBasis: "adult", acceptTerms: false }).success, false);
    assert.equal(parse({ acceptTerms: true }).success, false);
    assert.equal(parse({ ageBasis: "child", acceptTerms: true }).success, false);
  });

  it("requires a valid parent or guardian email for under-18s", () => {
    assert.equal(parse({ ageBasis: "guardian", acceptTerms: true }).success, false);
    assert.equal(parse({ ageBasis: "guardian", guardianEmail: "not-an-email", acceptTerms: true }).success, false);
    assert.ok(parse({ ageBasis: "guardian", guardianEmail: "parent@example.com", acceptTerms: true }).success);
  });

  it("records basis, guardian email, policy version and time, unverified", () => {
    const now = new Date("2026-11-05T10:00:00Z");
    const consent = parse({ ageBasis: "guardian", guardianEmail: " Parent@Example.com ", acceptTerms: true }).data;
    assert.deepEqual(consentRecord(consent, "kid@example.com", now), {
      basis: "guardian",
      guardianEmail: "parent@example.com",
      guardianVerified: false,
      method: "signup_form_declaration",
      policyVersion: POLICY_VERSION,
      consentedAt: "2026-11-05T10:00:00.000Z",
    });
  });

  it("drops a guardian email sent with an adult choice and rejects a student's own email as the parent's", () => {
    const adult = parse({ ageBasis: "adult", guardianEmail: "x@example.com", acceptTerms: true }).data;
    assert.equal(consentRecord(adult, "me@example.com").guardianEmail, null);
    const self = parse({ ageBasis: "guardian", guardianEmail: "ME@example.com", acceptTerms: true }).data;
    assert.throws(() => consentRecord(self, "me@example.com"), /different/);
  });
});
