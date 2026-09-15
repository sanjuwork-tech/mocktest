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
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
