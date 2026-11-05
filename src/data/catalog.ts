import { canonicalSiteUrl } from "../lib/site-url.ts";
import { EXAMS, type ExamSlug } from "../lib/exams/catalog.ts";
import {
  COMEDK_2026_BLUEPRINT,
  IISER_IAT_2026_BLUEPRINT,
  NEST_2026_BLUEPRINT,
  cuetBlueprint,
} from "../lib/blueprints/definitions.ts";
import type { ExamBlueprint } from "../lib/blueprints/types.ts";

export type ExamKey = ExamSlug;

export type Product = {
  id: string;
  slug: string;
  shortName: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  /** Bundles only: the sum of the single packs they contain. Single packs have none. */
  compareAtPrice?: number;
  mocks: number;
  /** Unused. Kept optional so older database rows still type-check; never show invented student counts. */
  students?: string;
  color: string;
  accent: string;
  pattern: string;
  features: string[];
  keywords: string[];
  isBundle?: boolean;
  bundleType?: "single" | "combo" | "all-access";
  includedExams?: ExamKey[];
  badge?: string;
};

/** Fail closed: nothing can be bought unless this is explicitly "true" (Razorpay is not live yet). */
export const paymentsEnabled = () =>
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

const CYCLE = 2027;
const cuet = EXAMS["cuet-ug"];
const CUET_SUBJECTS_PER_PACK = cuet.maxSubjects ?? 5;

/** Planned tests in each single pack, read from the exam catalog. */
export const plannedMocks: Record<ExamKey, number> = {
  "cuet-ug": cuet.plannedTests * CUET_SUBJECTS_PER_PACK,
  "iiser-iat": EXAMS["iiser-iat"].plannedTests,
  "niser-nest": EXAMS["niser-nest"].plannedTests,
  comedk: EXAMS.comedk.plannedTests,
};

// Pattern lines come from the official-pattern blueprints (sources cited in src/lib/blueprints/definitions.ts).
const marking = (b: ExamBlueprint) => {
  const s = b.sections[0];
  return s.penaltyPerQuestion
    ? `+${s.marksPerQuestion}/−${s.penaltyPerQuestion}`
    : `+${s.marksPerQuestion}, no negative marking`;
};
const paper = (b: ExamBlueprint) =>
  `${b.totalQuestions} questions · ${b.durationMinutes} min · ${marking(b)}`;
const cuetPaper = cuetBlueprint(cuet.subjects[0]);

const commonFeatures = [
  "NTA-style computer-based test screen",
  "Time spent on every question",
  "Section, topic and difficulty analysis",
  "Worked solutions for every question",
  "Overall analysis across your tests",
];

const singles: Product[] = [
  {
    id: `cuet-ug-${CYCLE}`,
    slug: "cuet-ug",
    shortName: "CUET UG",
    title: `CUET UG Test Series ${CYCLE}`,
    subtitle: `Pick any ${CUET_SUBJECTS_PER_PACK} of ${cuet.subjects.length} subjects. ${cuet.plannedTests} full-length tests in each.`,
    description: `Full-length CUET UG mock tests for the ${CUET_SUBJECTS_PER_PACK} subjects you choose from ${cuet.subjects.length}, including English and the General Aptitude Test. Each paper follows the official NTA pattern and marking, with worked solutions and analysis after every test.`,
    price: 1499,
    mocks: plannedMocks["cuet-ug"],
    color: "#1F5EFF",
    accent: "#B8FF34",
    pattern: `Any ${CUET_SUBJECTS_PER_PACK} subjects · ${cuetPaper.totalQuestions} questions · ${cuetPaper.durationMinutes} min · ${marking(cuetPaper)} per paper`,
    bundleType: "single",
    includedExams: ["cuet-ug"],
    features: [
      `${cuet.plannedTests} full-length tests in each of your ${CUET_SUBJECTS_PER_PACK} subjects (${plannedMocks["cuet-ug"]} in all)`,
      "Official CUET UG pattern and marking",
      ...commonFeatures,
      "Test 1 free in every subject",
    ],
    keywords: [
      `CUET UG mock test ${CYCLE}`,
      "CUET online test series",
      "CUET practice tests",
      "CUET General Test mocks",
    ],
    badge: "Test 1 free",
  },
  {
    id: `iiser-iat-${CYCLE}`,
    slug: "iiser-iat",
    shortName: "IISER IAT",
    title: `IISER IAT Test Series ${CYCLE}`,
    subtitle: "Build the cross-subject speed IAT rewards.",
    description: `${plannedMocks["iiser-iat"]} full-length IISER Aptitude Test mocks across Biology, Chemistry, Mathematics and Physics, on the official IAT pattern and marking, with worked solutions and analysis after every test.`,
    price: 1299,
    mocks: plannedMocks["iiser-iat"],
    color: "#B8FF34",
    accent: "#071A4D",
    pattern: `PCMB · ${paper(IISER_IAT_2026_BLUEPRINT)}`,
    bundleType: "single",
    includedExams: ["iiser-iat"],
    features: [
      `${plannedMocks["iiser-iat"]} full-length IAT mocks`,
      "Official IAT pattern and marking",
      ...commonFeatures,
      "Test 1 free",
    ],
    keywords: [
      `IISER IAT mock test ${CYCLE}`,
      "IAT test series",
      "IISER aptitude test mocks",
      "IAT online practice",
    ],
    badge: "Test 1 free",
  },
  {
    id: `niser-nest-${CYCLE}`,
    slug: "niser-nest",
    shortName: "NISER NEST",
    title: `NISER NEST Test Series ${CYCLE}`,
    subtitle: "Train for selection-heavy science questions.",
    description: `${plannedMocks["niser-nest"]} full-length NEST mocks for NISER Bhubaneswar and UM-DAE CEBS Mumbai aspirants, on the official NEST pattern and marking (your best ${NEST_2026_BLUEPRINT.scoringPolicy.bestSections} sections count), with worked solutions and analysis after every test.`,
    price: 999,
    mocks: plannedMocks["niser-nest"],
    color: "#FF704D",
    accent: "#071A4D",
    pattern: `PCMB · ${paper(NEST_2026_BLUEPRINT)} · best ${NEST_2026_BLUEPRINT.scoringPolicy.bestSections} sections count`,
    bundleType: "single",
    includedExams: ["niser-nest"],
    features: [
      `${plannedMocks["niser-nest"]} full-length NEST mocks`,
      "Official NEST pattern and marking",
      ...commonFeatures,
      "Test 1 free",
    ],
    keywords: [
      `NISER NEST mock test ${CYCLE}`,
      "NEST online test series",
      "NISER entrance mock",
      "NEST practice questions",
    ],
    badge: "Test 1 free",
  },
  {
    id: `comedk-${CYCLE}`,
    slug: "comedk",
    shortName: "COMEDK",
    title: `COMEDK UGET Test Series ${CYCLE}`,
    subtitle: "Build speed and accuracy across PCM.",
    description: `${plannedMocks.comedk} full-length COMEDK UGET mocks across Physics, Chemistry and Mathematics, on the official UGET pattern and marking, with worked solutions and analysis after every test.`,
    price: 1199,
    mocks: plannedMocks.comedk,
    color: "#071A4D",
    accent: "#B8FF34",
    pattern: `PCM · ${paper(COMEDK_2026_BLUEPRINT)}`,
    bundleType: "single",
    includedExams: ["comedk"],
    features: [
      `${plannedMocks.comedk} full-length UGET mocks`,
      "Official COMEDK UGET pattern and marking",
      ...commonFeatures,
      "Test 1 free",
    ],
    keywords: [
      `COMEDK mock test ${CYCLE}`,
      "COMEDK UGET test series",
      "COMEDK online mocks",
      "COMEDK PCM practice",
    ],
    badge: "Test 1 free",
  },
];

const single = (exam: ExamKey) => {
  const found = singles.find((p) => p.slug === exam);
  if (!found) throw new Error(`No single pack for ${exam}`);
  return found;
};

/** A bundle's test count and compare-at price are always the sums of the single packs it contains. */
function bundle(
  spec: Omit<Product, "mocks" | "compareAtPrice" | "features" | "isBundle" | "includedExams"> & {
    includedExams: ExamKey[];
  },
): Product {
  const parts = spec.includedExams.map(single);
  const mocks = parts.reduce((sum, p) => sum + p.mocks, 0);
  return {
    ...spec,
    isBundle: true,
    mocks,
    compareAtPrice: parts.reduce((sum, p) => sum + p.price, 0),
    features: [
      `${mocks} full-length mocks: ${parts.map((p) => `${p.shortName} (${p.mocks})`).join(" + ")}`,
      "Each exam's official pattern and marking",
      ...commonFeatures,
      "Test 1 of every included exam is free",
    ],
  };
}

const bundles: Product[] = [
  bundle({
    id: `bundle-cuet-iiser-${CYCLE}`,
    slug: "bundle-cuet-iiser",
    shortName: "CUET + IISER",
    title: `CUET UG + IISER IAT Combo ${CYCLE}`,
    subtitle: "One pass for central universities and the IISERs.",
    description: `The full CUET UG pack (any ${CUET_SUBJECTS_PER_PACK} subjects) and the full IISER IAT series together, each on its own exam's official pattern and marking.`,
    price: 2199,
    color: "#1F5EFF",
    accent: "#B8FF34",
    pattern: `CUET UG (any ${CUET_SUBJECTS_PER_PACK} subjects) + IISER IAT`,
    bundleType: "combo",
    includedExams: ["cuet-ug", "iiser-iat"],
    badge: "Combo",
    keywords: [
      "CUET IISER combo mock test",
      "CUET and IAT test series bundle",
      "IISER CUET mock package",
    ],
  }),
  bundle({
    id: `bundle-science-trio-${CYCLE}`,
    slug: "bundle-science-trio",
    shortName: "Science Trio",
    title: `Science Trio ${CYCLE}: IISER IAT + NISER NEST + CUET UG`,
    subtitle: "For students aiming at BS-MS and integrated MSc programmes.",
    description: `The full IISER IAT and NISER NEST series plus the CUET UG pack (any ${CUET_SUBJECTS_PER_PACK} subjects, for example Physics, Chemistry, Mathematics, Biology and English), each on its own exam's official pattern and marking.`,
    price: 2699,
    color: "#6366F1",
    accent: "#38BDF8",
    pattern: `IISER IAT + NISER NEST + CUET UG (any ${CUET_SUBJECTS_PER_PACK} subjects)`,
    bundleType: "combo",
    includedExams: ["iiser-iat", "niser-nest", "cuet-ug"],
    badge: "Combo",
    keywords: [
      "IISER NEST CUET science bundle",
      "pure science mock test series",
      "research entrance mock bundle",
    ],
  }),
  bundle({
    id: `bundle-all-access-${CYCLE}`,
    slug: "bundle-all-access",
    shortName: "All-Access Pass",
    title: `All-Access Pass ${CYCLE}: CUET UG, IAT, NEST and COMEDK`,
    subtitle: "All four of our test series in one pass.",
    description: `The CUET UG pack (any ${CUET_SUBJECTS_PER_PACK} subjects) plus the full IISER IAT, NISER NEST and COMEDK UGET series, each on its own exam's official pattern and marking.`,
    price: 3499,
    color: "#0F172A",
    accent: "#B8FF34",
    pattern: `All 4 exams · CUET UG (any ${CUET_SUBJECTS_PER_PACK} subjects) + IAT + NEST + COMEDK`,
    bundleType: "all-access",
    includedExams: ["cuet-ug", "iiser-iat", "niser-nest", "comedk"],
    badge: "All 4 exams",
    keywords: [
      "OurMocks all access pass",
      "all entrance exams test series bundle",
      "CUET IAT NEST COMEDK mock tests",
    ],
  }),
];

export const products: Product[] = [...singles, ...bundles];

/** What a bundle saves against buying its single packs separately; null for single packs. */
export function bundleSaving(product: Product) {
  if (!product.isBundle || !product.compareAtPrice || product.compareAtPrice <= product.price)
    return null;
  const amount = product.compareAtPrice - product.price;
  return { amount, percent: Math.floor((amount / product.compareAtPrice) * 100) };
}

export const productBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

/** Where "Take free Test 1" goes: the exam's own tab, or the free-tests page for bundles. */
export const freeTestHref = (product: Product) =>
  product.isBundle ? "/free-diagnostic" : `/free-diagnostic?exam=${product.slug}`;

export const formatRupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const siteConfig = {
  name: "OurMocks",
  shortDescription:
    "Discover more paths after Class 12 and explore mock test series for CUET UG, IISER IAT, NEST and COMEDK UGET.",
  url: canonicalSiteUrl(process.env.NEXT_PUBLIC_CANONICAL_URL),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@ourmocks.com",
};
