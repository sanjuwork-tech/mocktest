// Keep SEO identity stable across local runs and ephemeral preview deployments.
// Update this setting when an owned custom domain becomes the primary domain.
export function canonicalSiteUrl(configured?: string): string {
  const url = new URL(
    configured?.trim() || "https://mocktest-sigma.vercel.app",
  );
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  ) {
    throw new Error(
      "NEXT_PUBLIC_CANONICAL_URL must be a public HTTPS origin without a path.",
    );
  }
  return url.origin;
}
