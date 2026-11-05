import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { products, bundleSaving, freeTestHref } from "../src/data/catalog.ts";
import { EXAMS } from "../src/lib/exams/catalog.ts";

const bySlug = (slug) => products.find((p) => p.slug === slug);
const singles = products.filter((p) => !p.isBundle);
const bundles = products.filter((p) => p.isBundle);

describe("test-series catalog", () => {
  it("single packs follow the plan: 15 tests x any 5 CUET subjects, 25 for IAT, NEST and COMEDK", () => {
    assert.equal(EXAMS["cuet-ug"].plannedTests, 15);
    assert.equal(EXAMS["cuet-ug"].subjects.length, 13);
    assert.equal(bySlug("cuet-ug").mocks, 75);
    for (const slug of ["iiser-iat", "niser-nest", "comedk"]) {
      assert.equal(bySlug(slug).mocks, 25, slug);
      assert.equal(bySlug(slug).mocks, EXAMS[slug].plannedTests, slug);
    }
  });

  it("feature lines repeat the same counts as the pack", () => {
    for (const p of products) {
      const counts = (p.features.join(" ").match(/\b\d+(?= full-length)/g) ?? []).map(Number);
      assert.equal(counts.length, 1, `${p.slug} names its test count once`);
      assert.equal(counts[0], p.slug === "cuet-ug" ? EXAMS["cuet-ug"].plannedTests : p.mocks, p.slug);
    }
  });

  it("single packs have no compare-at price", () => {
    for (const p of singles) assert.equal(p.compareAtPrice, undefined, p.slug);
    for (const p of singles) assert.equal(bundleSaving(p), null, p.slug);
  });

  it("every bundle's count and compare-at price are the sums of its single packs", () => {
    assert.equal(bundles.length, 3);
    for (const b of bundles) {
      const parts = b.includedExams.map((slug) => {
        const part = bySlug(slug);
        assert.ok(part && !part.isBundle, `${b.slug} includes single pack ${slug}`);
        return part;
      });
      assert.equal(b.mocks, parts.reduce((s, p) => s + p.mocks, 0), `${b.slug} mocks`);
      assert.equal(b.compareAtPrice, parts.reduce((s, p) => s + p.price, 0), `${b.slug} compare-at`);
      assert.ok(b.price < b.compareAtPrice, `${b.slug} must cost less than its parts`);
      const saving = bundleSaving(b);
      assert.equal(saving.amount, b.compareAtPrice - b.price);
    }
    assert.equal(bySlug("bundle-all-access").mocks, 150);
  });

  it("uses the 2027 cycle and makes no claims the product does not deliver", () => {
    const text = JSON.stringify(products);
    assert.doesNotMatch(text, /2026/);
    for (const banned of [/rank/i, /percentile/i, /official NTA interface/i, /all[- ]india/i, /benchmark/i, /valid for/i, /month/i, /guarantee/i])
      assert.doesNotMatch(text, banned);
    for (const p of products) assert.match(p.title, /2027/, p.slug);
  });

  it("free Test 1 links go to the exam's tab, or the free-tests page for bundles", () => {
    assert.equal(freeTestHref(bySlug("niser-nest")), "/free-diagnostic?exam=niser-nest");
    assert.equal(freeTestHref(bySlug("bundle-all-access")), "/free-diagnostic");
  });
});
