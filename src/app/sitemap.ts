import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/catalog";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/exams", "/test-series", "/about"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "/exams" ? "daily" : "monthly",
    priority: path === "" || path === "/exams" ? 1 : 0.6,
  }));
}
