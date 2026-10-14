import { pageMetadata } from "@/lib/page-metadata";
import { CollegesShowcase } from "@/components/colleges-showcase";
import { JsonLd } from "@/components/json-ld";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata = pageMetadata(
  "Top Colleges & Universities in India — CUET, IISER, NEST & COMEDK Admissions",
  "Explore premier universities and engineering colleges in India with campus photos, NIRF rankings, popular degree courses, and cutoffs across CUET UG, IISER IAT, NISER NEST, and COMEDK.",
  "/colleges",
  [
    "top universities in India",
    "colleges under CUET",
    "IISER campuses list",
    "NISER and CEBS research institutes",
    "top COMEDK engineering colleges",
    "NIRF ranking universities 2026",
  ],
);

export default function CollegesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Top Participating Colleges & Universities in India",
          description:
            "Directory of premier institutes, universities, and engineering colleges accepting CUET, IAT, NEST, and COMEDK.",
        }}
      />

      <section style={{ maxWidth: "860px", margin: "0 auto 36px auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            padding: "5px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          <Sparkles size={15} /> Higher Education Campus Directory
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.15, color: "#0f172a", marginBottom: "14px" }}>
          The colleges behind the exams.
          <br />
          <em style={{ fontStyle: "normal", color: "var(--blue, #1f5eff)" }}>
            Explore where your preparation can lead.
          </em>
        </h1>
        <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto 24px auto" }}>
          Entrance exams are just the door. Discover the campus culture, NIRF rankings, popular undergraduate degrees, and research facilities across India’s finest institutions.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/free-diagnostic" className="button-primary">
            Attempt Free Full-Length Mock <ArrowRight size={16} />
          </Link>
          <Link href="/exams/compare" className="text-link" style={{ fontSize: "14px", fontWeight: 600 }}>
            Compare exam formats side-by-side ↗
          </Link>
        </div>
      </section>

      {/* Colleges Showcase Component with filter tabs */}
      <CollegesShowcase
        heading="Participating Campuses & Research Institutes"
        subheading="Filter by target examination to see central universities, autonomous science institutes, and top private engineering colleges."
        showFilters={true}
      />
    </main>
  );
}
