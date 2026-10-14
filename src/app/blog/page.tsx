import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Calendar, Sparkles, UserCheck, ArrowUpRight } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { blogPosts } from "@/data/blog";
import { siteConfig } from "@/data/catalog";

export const metadata = pageMetadata(
  "Entrance Exam Guides & 2027 Preparation Strategies — OurMocks Blog",
  "In-depth preparation roadmaps, book lists, syllabus analyses, and scoring hacks for CUET UG, IISER IAT, NEST, and COMEDK.",
  "/blog",
  [
    "CUET preparation strategy",
    "how to crack IISER IAT",
    "NEST 2027 preparation guide",
    "COMEDK speed tips",
    "entrance exam blog",
  ],
);

export default function BlogIndexPage() {
  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "OurMocks Preparation Guides & Analysis",
          description:
            "Authoritative articles on entrance examination strategies, college cutoffs, and scoring techniques after Class 12.",
          url: `${siteConfig.url}/blog`,
        }}
      />

      <section style={{ maxWidth: "840px", margin: "0 auto 48px auto", textAlign: "center" }}>
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
          <Sparkles size={15} /> 2026 / 2027 Academic Guides
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.15, color: "#0f172a", marginBottom: "16px" }}>
          Preparation strategies
          <br />
          <em style={{ fontStyle: "normal", color: "var(--blue, #1f5eff)" }}>
            written for clarity & results.
          </em>
        </h1>
        <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto 28px auto" }}>
          Deep-dive analysis on exam patterns, high-yield chapters, time allocation hacks, and college admission cutoffs written by top subject mentors.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/free-diagnostic" className="button-primary">
            Attempt Free Full-Length Mock <ArrowRight size={16} />
          </Link>
          <Link href="/colleges" className="text-link" style={{ fontSize: "14px", fontWeight: 600 }}>
            Explore top colleges & photos ↗
          </Link>
        </div>
      </section>

      {/* Blog Cards Grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "28px",
          marginBottom: "56px",
        }}
      >
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: "#e0edff",
                    color: "var(--blue, #1f5eff)",
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  {post.badge}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={13} /> {post.readTime}
                </span>
              </div>

              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", lineHeight: 1.3, marginBottom: "10px" }}>
                <Link href={`/blog/${post.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                  {post.title}
                </Link>
              </h2>

              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.55, marginBottom: "18px" }}>
                {post.subtitle}
              </p>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", marginBottom: "18px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", display: "block", marginBottom: "8px" }}>
                  Key Takeaways Inside:
                </span>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {post.keyTakeaways.slice(0, 2).map((item, idx) => (
                    <li key={idx} style={{ fontSize: "12px", color: "#334155", display: "flex", alignItems: "flex-start", gap: "6px", lineHeight: 1.4 }}>
                      <span style={{ color: "var(--blue)", fontWeight: 700 }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>{post.publishedDate}</span>
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--blue, #1f5eff)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  textDecoration: "none",
                }}
              >
                Read Master Guide <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Free Test CTA Block */}
      <section
        style={{
          background: "linear-gradient(135deg, #071A4D 0%, #1F5EFF 100%)",
          color: "#ffffff",
          borderRadius: "18px",
          padding: "36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 8px 24px rgba(7, 26, 77, 0.15)",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              background: "#B8FF34",
              color: "#071A4D",
              padding: "3px 10px",
              borderRadius: "999px",
            }}
          >
            Immediate Practice
          </span>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", margin: "10px 0 6px 0" }}>
            Turn Strategy into Real Marks
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "560px" }}>
            Reading about strategy only gets you so far. Attempt our 13 full-length CUET UG mock tests completely free and benchmark your pacing today.
          </p>
        </div>
        <Link
          href="/free-diagnostic"
          style={{
            background: "#ffffff",
            color: "#071A4D",
            fontWeight: 700,
            padding: "12px 24px",
            borderRadius: "12px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          Attempt Free Mock <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
