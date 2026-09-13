export type ExamKey = "cuet-ug" | "iiser-iat" | "niser-nest" | "comedk";

export type Product = {
  id: string;
  slug: ExamKey;
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
};

export const products: Product[] = [
  {
    id: "cuet-complete-2026",
    slug: "cuet-ug",
    shortName: "CUET UG",
    title: "CUET UG Complete Test Series 2026",
    subtitle: "One focused system for every subject you plan to attempt.",
    description: "Full-length CUET UG mock tests, domain-wise practice, English, General Test, percentile benchmarking, and detailed solutions built around the latest NTA pattern.",
    price: 1499,
    compareAtPrice: 2499,
    mocks: 45,
    students: "2,100+",
    color: "#1F5EFF",
    accent: "#B8FF34",
    pattern: "Domain + Language + GT",
    features: ["45 full-length mocks", "12 domain subjects", "NTA-style interface", "Video solutions"],
    keywords: ["CUET UG mock test 2026", "CUET online test series", "CUET practice tests", "CUET General Test mocks"],
  },
  {
    id: "iat-rank-booster-2026",
    slug: "iiser-iat",
    shortName: "IISER IAT",
    title: "IISER IAT Rank Booster 2026",
    subtitle: "Build the cross-subject speed IAT rewards.",
    description: "Research-aptitude mocks across Physics, Chemistry, Mathematics, and Biology with calibrated difficulty and all-India rank prediction.",
    price: 1299,
    compareAtPrice: 2199,
    mocks: 30,
    students: "1,400+",
    color: "#B8FF34",
    accent: "#071A4D",
    pattern: "PCMB · 60 questions",
    features: ["30 complete IAT mocks", "PCMB analytics", "AIR prediction", "Faculty solutions"],
    keywords: ["IISER IAT mock test 2026", "IAT test series", "IISER aptitude test mocks", "IAT online practice"],
  },
  {
    id: "nest-master-2026",
    slug: "niser-nest",
    shortName: "NISER NEST",
    title: "NISER NEST Master Series 2026",
    subtitle: "Train for selection-heavy science questions.",
    description: "NEST mock tests designed for NISER and CEBS aspirants, with section strategy, advanced problem sets, and step-by-step explanations.",
    price: 999,
    compareAtPrice: 1699,
    mocks: 24,
    students: "680+",
    color: "#FF704D",
    accent: "#071A4D",
    pattern: "PCMB · selective scoring",
    features: ["24 full NEST mocks", "Section strategy", "Advanced problem sets", "Detailed solutions"],
    keywords: ["NISER NEST mock test 2026", "NEST online test series", "NISER entrance mock", "NEST practice questions"],
  },
  {
    id: "comedk-power-2026",
    slug: "comedk",
    shortName: "COMEDK",
    title: "COMEDK UGET Power Pack 2026",
    subtitle: "Fast PCM practice without careless negatives.",
    description: "Timed COMEDK UGET mocks, high-speed PCM drills, chapter analytics, and percentile estimates for Karnataka engineering admissions.",
    price: 1199,
    compareAtPrice: 1999,
    mocks: 35,
    students: "910+",
    color: "#071A4D",
    accent: "#B8FF34",
    pattern: "PCM · 180 questions",
    features: ["35 full UGET mocks", "PCM speed drills", "Percentile estimate", "Mistake notebook"],
    keywords: ["COMEDK mock test 2026", "COMEDK UGET test series", "COMEDK online mocks", "COMEDK PCM practice"],
  },
];

export const productBySlug = (slug: string) => products.find((product) => product.slug === slug);

export const siteConfig = {
  name: "MockStride",
  shortDescription: "High-fidelity mock tests for CUET UG, IISER IAT, NISER NEST, and COMEDK UGET.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mockstride.com",
  email: "hello@mockstride.com",
};
