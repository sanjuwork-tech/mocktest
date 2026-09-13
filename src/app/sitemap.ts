import type { MetadataRoute } from "next";
import { products, siteConfig } from "@/data/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();
  const core = [
    { url: siteConfig.url, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${siteConfig.url}/test-series`, changeFrequency: "weekly" as const, priority: .9 },
    { url: `${siteConfig.url}/results`, changeFrequency: "monthly" as const, priority: .7 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly" as const, priority: .6 },
  ];
  return [...core.map(item => ({ ...item, lastModified: updated })), ...products.map(product => ({ url: `${siteConfig.url}/exams/${product.slug}`, lastModified: updated, changeFrequency: "weekly" as const, priority: .9 }))];
}
