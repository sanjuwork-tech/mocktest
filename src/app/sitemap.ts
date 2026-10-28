import type { MetadataRoute } from "next";
import { siteConfig, products } from "@/data/catalog";
import { exams } from "@/data/exams";
import { blogPosts } from "@/data/blog";
import { COLLEGES_CHECKED_ON } from "@/data/colleges";

// lastModified must reflect when content actually changed, never the build time.
const SITE_CONTENT_UPDATED = "2026-10-27";
const LEGAL_UPDATED = "2026-09-26";

const latest = (...dates: string[]) => dates.sort().at(-1)!;

export default function sitemap(): MetadataRoute.Sitemap {
  const examsUpdated = latest(...exams.map((e) => e.checkedOn));
  const blogUpdated = latest(...blogPosts.map((p) => p.updatedDate));
  const page = (path: string, lastModified: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    priority,
  });

  return [
    page("", SITE_CONTENT_UPDATED, 1.0),
    page("/exams", examsUpdated, 0.9),
    page("/free-diagnostic", SITE_CONTENT_UPDATED, 0.9),
    page("/exams/compare", SITE_CONTENT_UPDATED, 0.8),
    page("/exams/eligibility", SITE_CONTENT_UPDATED, 0.8),
    page("/exams/after-class-12", SITE_CONTENT_UPDATED, 0.8),
    page("/colleges", COLLEGES_CHECKED_ON, 0.8),
    page("/blog", blogUpdated, 0.8),
    page("/test-series", SITE_CONTENT_UPDATED, 0.7),
    page("/about", SITE_CONTENT_UPDATED, 0.5),
    page("/privacy", LEGAL_UPDATED, 0.3),
    page("/terms", LEGAL_UPDATED, 0.3),
    ...exams.map((exam) => page(`/exams/${exam.slug}`, exam.checkedOn, 0.9)),
    ...blogPosts.map((post) => page(`/blog/${post.slug}`, post.updatedDate, 0.7)),
    ...products.map((product) => page(`/test-series/${product.slug}`, SITE_CONTENT_UPDATED, 0.5)),
  ];
}
