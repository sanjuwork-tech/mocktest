import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/catalog";
export default function robots(): MetadataRoute.Robots {
  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV !== "production"
  ) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  // Let crawlers read noindex on sign-in/demo pages; robots is not access control.
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
