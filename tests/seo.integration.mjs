import test from "node:test";
import assert from "node:assert/strict";
const origin = process.env.SEO_TEST_ORIGIN || "http://localhost:3001";
const canonical =
  process.env.NEXT_PUBLIC_CANONICAL_URL || "https://mocktest-sigma.vercel.app";
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
    assert.ok(title && title.includes("TestDisha"), route);
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
        "The opportunity",
        "Who can apply?",
        "Exam format",
        "Application fees",
        "Important dates",
        "Official application",
        "Official updates",
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
test("sitemap covers exactly eight canonical public pages and robots advertises it", async () => {
  const response = await fetch(origin + "/sitemap.xml");
  assert.equal(response.status, 200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    urls.sort(),
    routes.map((route) => canonical + route).sort(),
  );
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
