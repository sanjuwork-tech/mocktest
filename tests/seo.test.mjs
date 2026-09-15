import test from "node:test";
import assert from "node:assert/strict";
import { canonicalSiteUrl } from "../src/lib/site-url.ts";

test("canonical identity uses the actual public site, independent of preview host", () => {
  assert.equal(canonicalSiteUrl(), "https://mocktest-sigma.vercel.app");
  assert.equal(
    canonicalSiteUrl("  https://example.com/  "),
    "https://example.com",
  );
});
test("canonical config rejects credentials, non-HTTPS, local origins and paths", () => {
  for (const value of [
    "http://example.com",
    "https://user:password@example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://[::1]",
    "https://example.com/path",
    "https://example.com/?tracking=1",
    "https://example.com/#section",
  ]) {
    assert.throws(() => canonicalSiteUrl(value));
  }
});
