import type { Metadata } from "next";
import { CatalogGrid } from "@/components/catalog-grid";
import { PageHero } from "@/components/page-hero";
import { products } from "@/data/catalog";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "Online Test Series 2026", description: "Compare CUET UG, IISER IAT, NISER NEST, and COMEDK online mock-test series with detailed solutions and analytics.", keywords: ["online test series 2026", "entrance exam mock tests", "CUET IAT NEST COMEDK test series"], alternates: { canonical: "/test-series" } };

export default function TestSeriesPage() {
  return <main><PageHero eyebrow="The complete library" title="Find your exam. Build your edge." copy="Every MockStride series mirrors the official format and gives you a useful next step after every attempt." /><section className="section-space"><div className="page-shell"><CatalogGrid products={products} /></div></section></main>;
}
