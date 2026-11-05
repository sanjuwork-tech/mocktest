import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/catalog";
export default function robots(): MetadataRoute.Robots {
  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV !== "production"
  ) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  // Robots is not access control; private routes also send X-Robots-Tag: noindex (next.config.ts).
  // A crawler obeys only the most specific group naming it, so every named group repeats the Disallow lines.
  // AI crawlers are allowed on public pages on purpose (GEO): being citable outweighs content-reuse concerns.
  const disallow = ["/api/", "/admin/", "/student/"];
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "Google-Extended",
    "PerplexityBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "Applebot-Extended",
    "CCBot",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
