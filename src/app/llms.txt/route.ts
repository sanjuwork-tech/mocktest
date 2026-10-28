import { NextResponse } from "next/server";
import { siteConfig } from "@/data/catalog";
import { exams } from "@/data/exams";
import { blogPosts } from "@/data/blog";

export const runtime = "edge";

// A plain-text map of the site for AI assistants: key facts first, each with its official source.
export function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.shortDescription}`,
    "",
    "OurMocks is an independent preparation platform. It is not affiliated with NTA, the IISERs, NISER, UM-DAE CEBS or COMEDK. Official bulletins always take precedence over this summary.",
    "",
    "## Exam facts (latest official cycle: 2026)",
    "",
    ...exams.flatMap((exam) => [
      `### ${exam.name} — ${exam.fullName}`,
      "",
      exam.quickAnswer,
      "",
      ...exam.pattern.map((row) => `- ${row.label}: ${row.value}`),
      ...(exam.seats ? [`- Seats: ${exam.seats}`] : []),
      `- 2027 status: ${exam.notification.detail}`,
      `- Full guide: ${siteConfig.url}/exams/${exam.slug}`,
      `- Official sources: ${exam.sources.map((s) => s.url).join(" , ")}`,
      `- Last verified: ${exam.checkedOn}`,
      "",
    ]),
    "## Guides",
    "",
    ...blogPosts.map((post) => `- [${post.title}](${siteConfig.url}/blog/${post.slug}): ${post.description}`),
    "",
    "## Other pages",
    "",
    `- [All exam guides](${siteConfig.url}/exams)`,
    `- [Side-by-side comparison](${siteConfig.url}/exams/compare)`,
    `- [Eligibility for all four exams](${siteConfig.url}/exams/eligibility)`,
    `- [Exams after Class 12 beyond JEE and NEET](${siteConfig.url}/exams/after-class-12)`,
    `- [Institutes by exam, with NIRF 2025 ranks](${siteConfig.url}/colleges)`,
    `- [Free CUET UG mock test](${siteConfig.url}/free-diagnostic)`,
    "",
    "## Contact",
    "",
    `- ${siteConfig.email || `${siteConfig.url}/about`}`,
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
