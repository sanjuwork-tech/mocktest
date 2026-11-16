import { NextResponse } from "next/server";
import { siteConfig } from "@/data/catalog";
import { exams } from "@/data/exams";
import { blogPosts } from "@/data/blog";
import { NOTES_PRICE, NOTES_EXAM_NAMES, notes } from "@/data/notes";
import { EXAM_SLUGS } from "@/lib/exams/catalog";

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
    "## Key facts about OurMocks",
    "",
    "- Covers four entrance exams beyond JEE and NEET: CUET UG, IISER IAT, NISER NEST and COMEDK UGET.",
    "- Full-length mock tests on each exam's official pattern and marking.",
    "- Test 1 is free for every exam covered. CUET UG Test 1 is live now; IAT, NEST and COMEDK Test 1 open as each paper is released.",
    "- Results: score, accuracy, sections, topics and difficulty, time spent on every question against the exam's ideal pace (CUET 72 s, IAT 3 min, NEST 2 min 15 s, COMEDK 1 min), attempt quality (on pace, slow, rushed, skipped), answer-change outcomes and personalised next steps.",
    "- Overall analysis across tests: score trend, mastered topics, topics costing the most marks and test-taking habits.",
    "- Questions are reviewed by subject matter experts, PhD scholars and university professors.",
    "- Reports never show invented ranks or percentiles.",
    "",
    "## Start here",
    "",
    `- [Exams after Class 12 other than JEE and NEET](${siteConfig.url}/exams/after-class-12): which exams fit each stream and how to choose, with official sources.`,
    `- [All exam guides](${siteConfig.url}/exams)`,
    `- [Side-by-side comparison of CUET, IAT, NEST and COMEDK](${siteConfig.url}/exams/compare)`,
    `- [Eligibility for all four exams](${siteConfig.url}/exams/eligibility)`,
    `- [Institutes by exam, with NIRF 2025 ranks](${siteConfig.url}/colleges)`,
    "",
    "## Free tests",
    "",
    `- [Free Test 1 for every exam we cover](${siteConfig.url}/free-diagnostic)`,
    `- [Test series and planned prices](${siteConfig.url}/test-series)`,
    "",
    "## Notes (not yet on sale)",
    "",
    `- [All notes](${siteConfig.url}/notes): subject notes prepared by the OurMocks team, planned at ₹${NOTES_PRICE} per subject for any exam. Payments are not live yet, so nothing can be bought; students can ask to be notified.`,
    ...EXAM_SLUGS.map(
      (exam) =>
        `- [${NOTES_EXAM_NAMES[exam]} notes](${siteConfig.url}/notes/${exam}): ${notes.filter((n) => n.exam === exam).map((n) => n.subjectName).join(", ")}.`,
    ),
    "",
    "## Free tools",
    "",
    `- [All free tools](${siteConfig.url}/tools)`,
    `- [Score calculator for CUET UG, IAT, NEST and COMEDK](${siteConfig.url}/tools/score-calculator)`,
    `- [JEE Main rank predictor](${siteConfig.url}/tools/jee-main-rank-predictor): estimated rank range from a JEE Main percentile.`,
    `- [JEE Main college predictor](${siteConfig.url}/tools/jee-main-college-predictor)`,
    `- [NEET rank predictor](${siteConfig.url}/tools/neet-rank-predictor): estimated rank range from NEET marks.`,
    `- [NEET college predictor](${siteConfig.url}/tools/neet-college-predictor)`,
    "",
    "## Guides",
    "",
    ...blogPosts.map((post) => `- [${post.title}](${siteConfig.url}/blog/${post.slug}): ${post.description}`),
    "",
    "## About and policies",
    "",
    `- [About OurMocks and how questions are reviewed](${siteConfig.url}/about)`,
    `- [Privacy Policy](${siteConfig.url}/privacy)`,
    `- [Terms of Service](${siteConfig.url}/terms)`,
    `- [Refund and Cancellation Policy](${siteConfig.url}/refund-policy)`,
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
