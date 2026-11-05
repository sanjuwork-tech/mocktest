import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { countPaper, normalizeVerdict, paperStatus, questionState } from "../src/app/admin/(dashboard)/review/status.ts";

describe("question review status", () => {
  it("any issue keeps a question open; one ok verifies it", () => {
    assert.equal(questionState([]), "unreviewed");
    assert.equal(questionState(["ok"]), "verified");
    assert.equal(questionState(["ok", "ok"]), "verified");
    assert.equal(questionState(["ok", "issue"]), "issue");
  });

  it("paper status from verdicts", () => {
    assert.deepEqual(paperStatus(countPaper([[], [], []])), { kind: "none", label: "Not reviewed" });
    assert.deepEqual(paperStatus(countPaper([["ok"], [], []])), { kind: "in_review", label: "In review 1 of 3" });
    assert.deepEqual(paperStatus(countPaper([["ok"], ["ok", "ok"], ["ok"]])), { kind: "verified", label: "Verified" });
    assert.deepEqual(paperStatus(countPaper([["ok"], ["issue"], []])), { kind: "issues", label: "1 issue" });
    assert.deepEqual(paperStatus(countPaper([["issue"], ["ok", "issue"], ["ok"]])), { kind: "issues", label: "2 issues" });
    assert.equal(paperStatus({ total: 0, verified: 0, issues: 0 }).kind, "none");
  });

  it("an issue needs a comment; comments are trimmed", () => {
    assert.equal(normalizeVerdict("issue", "   "), null);
    assert.equal(normalizeVerdict("issue", null), null);
    assert.deepEqual(normalizeVerdict("issue", " Option C is also correct "), { verdict: "issue", comment: "Option C is also correct" });
    assert.deepEqual(normalizeVerdict("ok", "  "), { verdict: "ok", comment: null });
  });
});

// Reviewers are external experts: they may only reach the review routes.
describe("reviewer role is review-only", () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name === "route.ts") files.push(path);
    }
  };
  walk("src/app/api/admin");

  it("only review routes and the session route accept reviewers", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const allowsReviewer = /requireAdmin\(\[[^\]]*"reviewer"/.test(source);
      const allowed = file.includes(`${join("api", "admin", "reviews")}`) || file.endsWith(join("session", "route.ts"));
      if (allowsReviewer) assert.ok(allowed, `${file} must not accept the reviewer role`);
    }
  });
});
