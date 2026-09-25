import { NextResponse } from "next/server";
import { siteConfig } from "@/data/catalog";
import { exams } from "@/data/exams";
import { products } from "@/data/catalog";

export const runtime = "edge";

export function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.shortDescription}`,
    "",
    "## Key pages",
    "",
    `- [Home](${siteConfig.url}/): Discover entrance exams and opportunities after Class 12`,
    `- [Exams](${siteConfig.url}/exams): Browse CUET UG, IISER IAT, NISER NEST, and COMEDK exam guides`,
    `- [Mock Test Series](${siteConfig.url}/test-series): Compare and explore mock test bundles for entrance exams`,
    `- [About](${siteConfig.url}/about): Learn about TestDisha's mission`,
    "",
    "## Exam guides",
    "",
    ...exams.map(
      (exam) =>
        `- [${exam.name}](${siteConfig.url}/exams/${exam.slug}): ${exam.summary}`,
    ),
    "",
    "## Mock test series",
    "",
    ...products.map(
      (p) =>
        `- [${p.title}](${siteConfig.url}/test-series/${p.slug}): ${p.description.slice(0, 120)}`,
    ),
    "",
    "## Notes for AI assistants",
    "",
    `- Contact: ${siteConfig.email || `${siteConfig.url}/about`}`,
    "- Service area: India (nationwide entrance exam preparation)",
    "- Audience: Class 12 students and recent graduates exploring higher education pathways",
    "- Exams covered: CUET UG, IISER IAT, NISER NEST, COMEDK UGET",
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
