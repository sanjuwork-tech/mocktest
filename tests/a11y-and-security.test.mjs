import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import katex from "katex";
import nextConfig from "../next.config.ts";

// ─────────────────────────────────────────────────────────────
// 1. Security Headers and Asset Access Policy Auditing
// ─────────────────────────────────────────────────────────────

describe("Phase 7: Security headers and asset policy auditing", () => {
  it("enforces strict security headers globally across all routes", async () => {
    assert.equal(typeof nextConfig.headers, "function", "nextConfig must define headers function");
    const headersConfig = await nextConfig.headers();
    assert.ok(Array.isArray(headersConfig));

    const globalRule = headersConfig.find((h) => h.source === "/:path*");
    assert.ok(globalRule, "must include a global /:path* security header rule");

    const headerMap = new Map(globalRule.headers.map((h) => [h.key.toLowerCase(), h.value]));

    // Nosniff
    assert.equal(headerMap.get("x-content-type-options"), "nosniff");
    // Clickjacking defense
    assert.equal(headerMap.get("x-frame-options"), "DENY");
    // Referrer isolation
    assert.equal(headerMap.get("referrer-policy"), "strict-origin-when-cross-origin");
    // CSP frame ancestors and object restrictions
    const csp = headerMap.get("content-security-policy");
    assert.ok(csp, "CSP must be present");
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.ok(csp.includes("object-src 'none'"));
    assert.ok(csp.includes("base-uri 'self'"));
    // Permissions policy for camera, mic, and geolocation
    const permissions = headerMap.get("permissions-policy");
    assert.ok(permissions, "Permissions-Policy must be present");
    assert.ok(permissions.includes("camera=()"));
    assert.ok(permissions.includes("microphone=()"));
    assert.ok(permissions.includes("geolocation=()"));
    // Cross origin opener policy
    assert.equal(headerMap.get("cross-origin-opener-policy"), "same-origin");
    // HSTS preload
    const hsts = headerMap.get("strict-transport-security");
    assert.ok(hsts, "Strict-Transport-Security must be configured");
    assert.ok(hsts.includes("max-age="));
    assert.ok(hsts.includes("includeSubDomains"));
  });

  it("prohibits search engine indexing of private admin, student, and api paths", async () => {
    const headersConfig = await nextConfig.headers();
    const protectedPaths = ["/admin/:path*", "/student/:path*", "/api/:path*"];

    for (const path of protectedPaths) {
      const rule = headersConfig.find((h) => h.source === path);
      assert.ok(rule, `Protected path ${path} must have specific header rule`);
      const robots = rule.headers.find((h) => h.key.toLowerCase() === "x-robots-tag");
      assert.ok(robots, `${path} must define X-Robots-Tag`);
      assert.equal(robots.value, "noindex, nofollow");
    }
  });

  it("disables Next.js powered-by header to prevent fingerprinting", () => {
    assert.equal(nextConfig.poweredByHeader, false);
    assert.equal(nextConfig.reactStrictMode, true);
  });
});

// ─────────────────────────────────────────────────────────────
// 2. Responsive Equation and Scientific Content Protection
// ─────────────────────────────────────────────────────────────

describe("Phase 7: Scientific renderer and responsive equation containment", () => {
  const studentCss = readFileSync(new URL("../src/app/student/student.css", import.meta.url), "utf8");

  it("ensures science-formula and katex-display allow horizontal scroll without breaking viewport", () => {
    // Formula CSS rules
    assert.ok(studentCss.includes(".science-formula"), "must define .science-formula");
    assert.ok(studentCss.includes("overflow-x: auto"), ".science-formula must support horizontal scrolling");
    assert.ok(studentCss.includes("max-width: 100%"), ".science-formula must not exceed container width");
    assert.ok(studentCss.includes("-webkit-overflow-scrolling: touch"), "touch devices must have momentum scrolling");

    // KaTeX display block containment
    assert.ok(studentCss.includes(".katex-display"), "must style .katex-display");
    assert.ok(studentCss.includes("scrollbar-width: thin"), "must use sleek thin scrollbars");
  });

  it("renders complex equations with dual HTML and MathML for screen reader accessibility", () => {
    const complexLatex = "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}";
    const rendered = katex.renderToString(complexLatex, {
      displayMode: true,
      throwOnError: false,
      output: "htmlAndMathml",
    });

    assert.ok(rendered.includes("<math"), "rendered math must output accessible MathML");
    assert.ok(rendered.includes("<annotation"), "MathML must include latex annotation");
    assert.ok(rendered.includes("katex-html"), "must include visual KaTeX HTML");
  });
});

// ─────────────────────────────────────────────────────────────
// 3. Accessibility (a11y) Semantics and Focus Management
// ─────────────────────────────────────────────────────────────

describe("Phase 7: Frontend accessibility semantics and keyboard navigation", () => {
  const studentCss = readFileSync(new URL("../src/app/student/student.css", import.meta.url), "utf8");
  const testPlayerSource = readFileSync(new URL("../src/components/student/test-player.tsx", import.meta.url), "utf8");

  it("question palette buttons meet minimum accessible touch target size (>= 42px)", () => {
    assert.ok(studentCss.includes("min-height: 42px;"), "palette button must be at least 42px high");
    assert.ok(studentCss.includes("min-width: 42px;"), "palette button must be at least 42px wide");
  });

  it("interactive elements provide high-contrast :focus-visible outlines", () => {
    assert.ok(studentCss.includes(".question-palette button:focus-visible"));
    assert.ok(studentCss.includes(".button-primary:focus-visible"));
    assert.ok(studentCss.includes(".student-secondary:focus-visible"));
    assert.ok(studentCss.includes("outline: 3px solid var(--blue);"));
  });

  it("submit modal dialog defines proper aria-labelledby and aria-describedby associations", () => {
    assert.ok(testPlayerSource.includes('aria-labelledby="submit-dialog-title"'));
    assert.ok(testPlayerSource.includes('aria-describedby="submit-dialog-desc"'));
    assert.ok(testPlayerSource.includes('id="submit-dialog-title"'));
    assert.ok(testPlayerSource.includes('id="submit-dialog-desc"'));
  });

  it("question palette is marked with navigation landmark role and descriptive aria-labels", () => {
    assert.ok(testPlayerSource.includes('role="navigation"'));
    assert.ok(testPlayerSource.includes('aria-label="Question navigation"'));
    assert.ok(testPlayerSource.includes('aria-current={i === current ? "step" : undefined}'));
    assert.ok(testPlayerSource.includes('aria-label={`Question ${i + 1},'));
  });
});

// ─────────────────────────────────────────────────────────────
// 4. Responsive Layout Breakpoints
// ─────────────────────────────────────────────────────────────

describe("Phase 7: Small screen responsive layout adaptability", () => {
  const studentCss = readFileSync(new URL("../src/app/student/student.css", import.meta.url), "utf8");

  it("palette grid adapts gracefully from 5 cols (mobile) to 10 cols (tablet/desktop)", () => {
    // Default mobile/sidebar grid
    assert.ok(studentCss.includes("grid-template-columns: repeat(5, 1fr);"));
    // Tablet/medium screen grid
    assert.ok(studentCss.includes("grid-template-columns: repeat(10, 1fr);"));
  });

  it("test layout adapts to single column on mobile screens", () => {
    assert.ok(studentCss.includes(".test-layout"));
    assert.ok(studentCss.includes("grid-template-columns: 1fr;"));
  });
});
