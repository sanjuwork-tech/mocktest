import test from "node:test";
import assert from "node:assert/strict";
const origin = process.env.SEO_TEST_ORIGIN || "http://localhost:3001";
const canonical =
  process.env.NEXT_PUBLIC_CANONICAL_URL || "https://ourmocks.com";
const routes = [
  "",
  "/exams",
  "/test-series",
  "/about",
  "/exams/cuet-ug",
  "/exams/iiser-iat",
  "/exams/niser-nest",
  "/exams/comedk",
];
const attr = (tag, key) => tag.match(new RegExp(`\\b${key}="([^"]*)"`))?.[1];

test("public pages expose complete unique HTML, metadata and structured data without executing JavaScript", async () => {
  const titles = new Set();
  for (const route of routes) {
    const response = await fetch(origin + route, { redirect: "manual" });
    assert.equal(response.status, 200, route);
    const raw = await response.text();
    const html = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    const canonicalTags = (html.match(/<link\b[^>]*>/g) || []).filter(
      (tag) => attr(tag, "rel") === "canonical",
    );
    assert.equal(canonicalTags.length, 1, route);
    const actual = new URL(attr(canonicalTags[0], "href"));
    assert.equal(actual.origin, canonical, route);
    assert.equal(actual.pathname, route || "/", route);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    assert.ok(title && (title.includes("OurMocks") || title.includes("TestDisha")), route);
    assert.ok(!titles.has(title), "Unique title " + route);
    titles.add(title);
    const meta = html.match(/<meta\b[^>]*>/g) || [];
    assert.ok(
      meta.some(
        (tag) =>
          attr(tag, "name") === "description" &&
          attr(tag, "content")?.length > 30,
      ),
    );
    assert.ok(
      !meta.some(
        (tag) =>
          attr(tag, "name") === "robots" &&
          attr(tag, "content")?.includes("noindex"),
      ),
      route,
    );
    const data = [
      ...raw.matchAll(
        /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].map((match) => JSON.parse(match[1]));
    assert.ok(
      data.some((value) =>
        value["@graph"]?.some((item) => item["@type"] === "Organization"),
      ),
    );
    if (route.startsWith("/exams/")) {
      for (const phrase of [
        "Who can apply?",
        "exam pattern (2026 official)",
        "Application fees",
        "dates, for reference",
        "Official website",
        "Latest official status",
        "frequently asked questions",
      ])
        assert.ok(html.includes(phrase), route + ": " + phrase);
      assert.ok(
        data.some((value) =>
          value["@graph"]?.some((item) => item["@type"] === "BreadcrumbList"),
        ),
      );
      assert.ok(!raw.includes("NEXT_REDIRECT"), route);
    }
  }
});
test("sitemap lists the public pages with real content dates and robots advertises it", async () => {
  const response = await fetch(origin + "/sitemap.xml");
  assert.equal(response.status, 200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  for (const route of routes) assert.ok(urls.includes(canonical + route), route);
  assert.ok(!urls.includes(canonical + "/resources"), "navigation hub stays out of the sitemap");
  const dates = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  assert.equal(dates.length, urls.length);
  for (const date of dates) assert.match(date, /^\d{4}-\d{2}-\d{2}$/, "lastmod is a content date, not a build timestamp");
  const robots = await (await fetch(origin + "/robots.txt")).text();
  assert.ok(robots.includes(`Sitemap: ${canonical}/sitemap.xml`));
  assert.ok(robots.includes("Allow: /"));
  assert.ok(!robots.includes("Disallow: /\n"));
});
test("private routes are noindex and unknown exam slugs are real 404s", async () => {
  for (const route of ["/student/login", "/admin/login", "/api/health"]) {
    const response = await fetch(origin + route);
    assert.match(response.headers.get("x-robots-tag") || "", /noindex/, route);
  }
  const missing = await fetch(origin + "/exams/nonexistent-exam", {
    redirect: "manual",
  });
  assert.equal(missing.status, 404);
});
