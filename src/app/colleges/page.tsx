import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { CollegesShowcase } from "@/components/colleges-showcase";
import { JsonLd } from "@/components/json-ld";
import { collegesData, COLLEGES_CHECKED_ON } from "@/data/colleges";
import { siteConfig } from "@/data/catalog";

export const metadata = pageMetadata(
  "Colleges via CUET, IAT, NEST & COMEDK",
  "Which institutes admit through CUET UG, IISER IAT, NEST and COMEDK — with official NIRF 2025 ranks, admission routes, programmes and seats.",
  "/colleges",
);

export default function CollegesPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Institutes admitting through CUET UG, IISER IAT, NISER NEST and COMEDK UGET",
          url: `${siteConfig.url}/colleges`,
          dateModified: COLLEGES_CHECKED_ON,
          numberOfItems: collegesData.length,
          itemListElement: collegesData.map((college, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "CollegeOrUniversity",
              name: college.name,
              url: college.officialUrl,
              foundingDate: String(college.established),
              address: { "@type": "PostalAddress", addressLocality: college.location, addressRegion: college.state, addressCountry: "IN" },
            },
          })),
        }}
      />
      <section className="guide-hero page-shell">
        <p className="eyebrow">Colleges</p>
        <h1>
          Where each exam
          <br />
          <em>can take you.</em>
        </h1>
        <p className="hero-copy">
          Central universities through CUET, IISERs, IISc and IIT Madras&apos;s BS through IAT, NISER and CEBS through
          NEST, and Karnataka&apos;s private engineering colleges through COMEDK — with how admission actually works at
          each.
        </p>
        <div className="hero-actions">
          <Link href="/exams" className="button-primary">
            Read the exam guides <ArrowRight size={16} />
          </Link>
          <Link href="/exams/compare" className="text-link">
            Compare the four exams →
          </Link>
        </div>
      </section>
      <div className="page-shell">
        <CollegesShowcase />
        <section className="exam-cta-band">
          <div>
            <span className="badge-lime">Free</span>
            <h2>Know where you stand before the real exam</h2>
            <p>Take a full CUET paper on the official pattern and get a section and topic breakdown.</p>
          </div>
          <Link href="/free-diagnostic" className="button-light">
            Take a free mock <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
