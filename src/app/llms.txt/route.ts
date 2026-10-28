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
      `- Syllabus: ${siteConfig.url}/exams/${exam.slug}/syllabus`,
      `- Previous year papers: ${siteConfig.url}/exams/${exam.slug}/previous-year-papers`,
      `- Official sources: ${exam.sources.map((s) => s.url).join(" , ")}`,
      `- Last verified: ${exam.checkedOn}`,
      "",
    ]),
    "## What the mock tests include",
    "",
    "- Full-length tests on each exam's official pattern and marking; Test 1 is free.",
    "- Results: score, accuracy, sections, topics and difficulty, time spent on every question against the exam's ideal pace (CUET 72 s, IAT 3 min, NEST 2 min 15 s, COMEDK 1 min), attempt quality (on pace, slow, rushed, skipped), answer-change outcomes and personalised next steps.",
    "- Overall analysis across tests: score trend, mastered topics, topics costing the most marks and test-taking habits.",
    "- Questions are reviewed by subject matter experts, PhD scholars and university professors.",
    "",
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
    `- [Score calculator for all four exams](${siteConfig.url}/tools/score-calculator)`,
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
