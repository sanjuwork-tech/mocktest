import test from "node:test";
import assert from "node:assert/strict";
import { exams, filterExams, reviewIsStale } from "../src/data/exams.ts";
import { requestError } from "../src/lib/request-error.ts";

test("all four exams have unique anchors and complete guide sections", () => {
  assert.deepEqual(
    exams.map((exam) => exam.slug),
    ["cuet-ug", "iiser-iat", "niser-nest", "comedk"],
  );
  for (const exam of exams) {
    for (const field of [
      "summary",
      "opportunity",
      "programmes",
      "format",
      "syllabus",
      "fee",
      "admission",
    ])
      assert.ok(exam[field].length > 20, `${exam.slug}: ${field}`);
    assert.ok(exam.eligibility.length >= 2);
    assert.ok(exam.dates.length >= 2);
    assert.ok(exam.sources.length >= 2);
  }
});
test("search handles whitespace, case, multiple words and category intersections", () => {
  assert.equal(filterExams("  nIsEr   ").length, 1);
  assert.equal(filterExams("  ").length, 4);
  assert.equal(filterExams("science", "Science & research").length, 2);
  assert.equal(filterExams("science", "Engineering").length, 0);
  assert.equal(filterExams("private karnataka")[0].slug, "comedk");
  assert.equal(filterExams("not-an-exam").length, 0);
});
test("historical and unverified links never claim registration is open", () => {
  for (const exam of exams)
    assert.ok(["closed", "unverified"].includes(exam.application.status));
  assert.equal(
    exams.find((exam) => exam.slug === "iiser-iat").verification,
    "partial",
  );
});
test("official outbound destinations use HTTPS and approved authority/vendor hosts", () => {
  const allowed = [
    "cuet.nta.nic.in",
    "cdnbbsr.s3waas.gov.in",
    "examinationservices.nic.in",
    "www.iiseradmission.in",
    "www.iiserkol.ac.in",
    "www.nestexam.in",
    "www.niser.ac.in",
    "www.cbs.ac.in",
    "cdn3.digialm.com",
    "www.comedk.org",
    "cdn.digialm.com",
  ];
  for (const exam of exams)
    for (const link of [
      ...exam.sources,
      exam.application,
      exam.notification.source,
    ]) {
      const url = new URL(link.url);
      assert.equal(url.protocol, "https:");
      assert.ok(allowed.includes(url.hostname), url.hostname);
    }
});
test("review freshness expires after seven days using an explicit India timezone", () => {
  assert.equal(
    reviewIsStale("2026-09-13", new Date("2026-09-13T00:00:00+05:30")),
    false,
  );
  assert.equal(
    reviewIsStale("2026-09-13", new Date("2026-09-20T00:00:00+05:30")),
    false,
  );
  assert.equal(
    reviewIsStale("2026-09-13", new Date("2026-09-20T00:00:01+05:30")),
    true,
  );
});
test("request errors handle validation errors and malformed server responses", () => {
  assert.equal(requestError(null, "Retry"), "Retry");
  assert.equal(
    requestError({ error: "Unauthorized" }, "Retry"),
    "Unauthorized",
  );
  assert.equal(
    requestError(
      { error: { fieldErrors: { price: ["Too small"], title: ["Required"] } } },
      "Retry",
    ),
    "price: Too small. title: Required",
  );
  assert.equal(requestError({ error: { unexpected: true } }, "Retry"), "Retry");
});
