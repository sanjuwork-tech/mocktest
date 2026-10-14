import { canonicalSiteUrl } from "../lib/site-url.ts";

export type ExamKey = "cuet-ug" | "iiser-iat" | "niser-nest" | "comedk";

export type Product = {
  id: string;
  slug: string;
  shortName: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  compareAtPrice: number;
  mocks: number;
  students: string;
  color: string;
  accent: string;
  pattern: string;
  features: string[];
  keywords: string[];
  isBundle?: boolean;
  bundleType?: "single" | "combo" | "all-access";
  includedExams?: string[];
  savingsText?: string;
  badge?: string;
};

export const products: Product[] = [
  // ── 1. Individual Exam Series ──────────────────────────────────────────
  {
    id: "cuet-complete-2026",
    slug: "cuet-ug",
    shortName: "CUET UG",
    title: "CUET UG Complete Test Series 2026",
    subtitle: "One focused system for every subject you plan to attempt.",
    description:
      "Full-length CUET UG mock tests, domain-wise practice across 13 subjects, English Language, General Test, percentile benchmarking, and detailed solutions built around the latest NTA pattern.",
    price: 1499,
    compareAtPrice: 2499,
    mocks: 45,
    students: "2,100+",
    color: "#1F5EFF",
    accent: "#B8FF34",
    pattern: "Domain + Language + GT",
    isBundle: false,
    bundleType: "single",
    includedExams: ["cuet-ug"],
    features: [
      "45 full-length mocks",
      "13 domain subjects & languages",
      "Official NTA CBT interface",
      "In-depth step-by-step solutions",
      "Per-question pacing analysis",
    ],
    keywords: [
      "CUET UG mock test 2026",
      "CUET online test series",
      "CUET practice tests",
      "CUET General Test mocks",
    ],
    badge: "13 Full Tests Free",
  },
  {
    id: "iat-rank-booster-2026",
    slug: "iiser-iat",
    shortName: "IISER IAT",
    title: "IISER IAT Rank Booster 2026",
    subtitle: "Build the cross-subject speed IAT rewards.",
    description:
      "Research-aptitude mocks across Physics, Chemistry, Mathematics, and Biology with calibrated difficulty and all-India rank prediction for admission to 7 IISERs, IISc, and IIT Madras.",
    price: 1299,
    compareAtPrice: 2199,
    mocks: 30,
    students: "1,400+",
    color: "#B8FF34",
    accent: "#071A4D",
    pattern: "PCMB · 60 questions · 180 mins",
    isBundle: false,
    bundleType: "single",
    includedExams: ["iiser-iat"],
    features: [
      "30 complete IAT mocks",
      "Full PCMB coverage (60 Qs, +4/-1)",
      "All-India rank prediction",
      "Research aptitude problem sets",
      "Mistake book & topic gap tracker",
    ],
    keywords: [
      "IISER IAT mock test 2026",
      "IAT test series",
      "IISER aptitude test mocks",
      "IAT online practice",
    ],
    badge: "Coming Soon",
  },
  {
    id: "niser-nest-2026",
    slug: "niser-nest",
    shortName: "NISER NEST",
    title: "NISER NEST Master Series 2026",
    subtitle: "Train for selection-heavy science questions.",
    description:
      "NEST mock tests designed for NISER Bhubaneswar and UM-DAE CEBS Mumbai aspirants, with sectional strategy, advanced problem sets, and step-by-step explanations.",
    price: 999,
    compareAtPrice: 1699,
    mocks: 24,
    students: "680+",
    color: "#FF704D",
    accent: "#071A4D",
    pattern: "PCMB · selective scoring",
    isBundle: false,
    bundleType: "single",
    includedExams: ["niser-nest"],
    features: [
      "24 full NEST mocks",
      "Sectional cutoff strategy",
      "Advanced conceptual problem sets",
      "Detailed step-by-step solutions",
    ],
    keywords: [
      "NISER NEST mock test 2026",
      "NEST online test series",
      "NISER entrance mock",
      "NEST practice questions",
    ],
    badge: "Coming Soon",
  },
  {
    id: "comedk-power-2026",
    slug: "comedk",
    shortName: "COMEDK",
    title: "COMEDK UGET Power Pack 2026",
    subtitle: "Build speed and accuracy across PCM.",
    description:
      "Timed COMEDK UGET mocks, high-speed PCM drills, chapter analytics, and percentile estimates for Karnataka engineering admissions (RVCE, BMSCE, MSRIT).",
    price: 1199,
    compareAtPrice: 1999,
    mocks: 35,
    students: "910+",
    color: "#071A4D",
    accent: "#B8FF34",
    pattern: "PCM · 180 questions · No Negative",
    isBundle: false,
    badge: "Coming Soon",
    bundleType: "single",
    includedExams: ["comedk"],
    features: [
      "35 full UGET mocks",
      "High-speed PCM 180-Q drills",
      "Percentile & rank estimate",
      "Mistake notebook & speed optimizer",
    ],
    keywords: [
      "COMEDK mock test 2026",
      "COMEDK UGET test series",
      "COMEDK online mocks",
      "COMEDK PCM practice",
    ],
  },

  // ── 2. Multi-Exam Value Bundles ───────────────────────────────────────
  {
    id: "bundle-cuet-iiser-2026",
    slug: "bundle-cuet-iiser",
    shortName: "CUET + IISER",
    title: "CUET UG + IISER IAT Dual Aspirant Combo",
    subtitle: "Dual preparation pass for Central Universities and National Research Institutes.",
    description:
      "Target both Central Universities (DU, BHU, JNU) and National Research Institutes (7 IISERs, IISc). Includes full domain subject tests, English, General Test, and rigorous PCMB aptitude series with combined analytics.",
    price: 2199,
    compareAtPrice: 3698,
    mocks: 75,
    students: "1,850+",
    color: "#1F5EFF",
    accent: "#B8FF34",
    pattern: "CUET Domains + IAT PCMB (75 Mocks)",
    isBundle: true,
    bundleType: "combo",
    includedExams: ["cuet-ug", "iiser-iat"],
    savingsText: "Save ₹1,499 (41% OFF)",
    badge: "Popular Combo",
    features: [
      "75 full mock tests across both exams",
      "All 13 CUET subjects + IISER PCMB",
      "Dual percentile benchmarking & AIR",
      "Live dual-timer CBT exam simulator",
      "12-month unlimited access",
    ],
    keywords: [
      "CUET IISER combo mock test",
      "CUET and IAT test series bundle",
      "IISER CUET mock package",
    ],
  },
  {
    id: "bundle-science-trio-2026",
    slug: "bundle-science-trio",
    shortName: "Science Trio",
    title: "Pure Science & Research Super Combo (IISER + NEST + CUET Science)",
    subtitle: "The definitive preparation bundle for India's premier science institutes.",
    description:
      "Comprehensive mock test suite covering IISER IAT, NISER NEST, and CUET UG Science (Physics, Chemistry, Mathematics, Biology). Designed for dedicated science researchers aiming for BS-MS and Integrated MSc programs.",
    price: 2699,
    compareAtPrice: 4197,
    mocks: 99,
    students: "920+",
    color: "#6366F1",
    accent: "#38BDF8",
    pattern: "IISER + NEST + CUET Science (99 Mocks)",
    isBundle: true,
    bundleType: "combo",
    includedExams: ["iiser-iat", "niser-nest", "cuet-ug"],
    savingsText: "Save ₹1,498 (36% OFF)",
    badge: "Research Focus",
    features: [
      "99 full-length mock tests across 3 exams",
      "Complete PCMB calibrated difficulty",
      "IISER + NISER + Central University cutoffs",
      "Weak-topic diagnostic radar analysis",
      "12-month validity till 2026 admissions",
    ],
    keywords: [
      "IISER NEST CUET science bundle",
      "pure science mock test series",
      "research entrance mock bundle",
    ],
  },
  {
    id: "bundle-all-access-2026",
    slug: "bundle-all-access",
    shortName: "All-Access Pass",
    title: "OurMocks 2026 All-Access Super Pass",
    subtitle: "Every mock test, every subject, every exam series in one unlimited pass.",
    description:
      "The ultimate all-inclusive preparation pass. Unlocks complete mock series for CUET UG (13 subjects), IISER IAT, NISER NEST, and COMEDK UGET. Take any test anytime, benchmark your scores, and keep all your college options open.",
    price: 3499,
    compareAtPrice: 5996,
    mocks: 134,
    students: "3,400+",
    color: "#0F172A",
    accent: "#B8FF34",
    pattern: "All 4 Exams · 134 Mocks · All Subjects",
    isBundle: true,
    bundleType: "all-access",
    includedExams: ["cuet-ug", "iiser-iat", "niser-nest", "comedk"],
    savingsText: "Save ₹2,497 (42% OFF)",
    badge: "Best Value Pass",
    features: [
      "134 full-length mock tests across all 4 exams",
      "Complete access to all 13 CUET domains & PCMB",
      "Engineering, Research & Central University routes",
      "Unified cross-exam performance dashboard",
      "Priority solution walkthroughs & updates",
    ],
    keywords: [
      "OurMocks all access pass",
      "all entrance exams test series bundle",
      "CUET IAT NEST COMEDK mega pack",
    ],
  },
];

export const productBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const siteConfig = {
  name: "OurMocks",
  shortDescription:
    "Discover more paths after Class 12 and explore mock test series for CUET UG, IISER IAT, NEST and COMEDK UGET.",
  url: canonicalSiteUrl(process.env.NEXT_PUBLIC_CANONICAL_URL),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@ourmocks.com",
};
