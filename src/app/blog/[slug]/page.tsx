import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { blogPosts, getBlogPost } from "@/data/blog";
import { siteConfig } from "@/data/catalog";
import { CollegesShowcase } from "@/components/colleges-showcase";
import { SocialShare } from "@/components/social-share";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return pageMetadata(
    `${post.title} — OurMocks Master Guide`,
    post.subtitle,
    `/blog/${slug}`,
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const url = `${siteConfig.url}/blog/${slug}`;

  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.subtitle,
          url,
          author: {
            "@type": "Organization",
            name: post.author,
          },
          publisher: {
            "@type": "Organization",
            name: "OurMocks",
            url: siteConfig.url,
          },
          datePublished: post.publishedDate,
        }}
      />

      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        {/* Back Link */}
        <Link
          href="/blog"
          className="text-link"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", marginBottom: "20px" }}
        >
          <ArrowLeft size={15} /> All Preparation Guides
        </Link>

        {/* Hero Meta */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
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
          <span style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={13} /> {post.publishedDate}
          </span>
          <span style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Clock size={13} /> {post.readTime}
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2, color: "#0f172a", marginBottom: "14px" }}>
          {post.title}
        </h1>
        <p style={{ fontSize: "17px", color: "#475569", lineHeight: 1.6, marginBottom: "24px" }}>
          {post.subtitle}
        </p>

        {/* Social Share top */}
        <SocialShare title={post.title} url={url} description={post.subtitle} />

        {/* Key Takeaways Box */}
        <section
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
            padding: "24px",
            margin: "28px 0 36px 0",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#166534", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={18} /> Essential Strategy Takeaways
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {post.keyTakeaways.map((item, idx) => (
              <li key={idx} style={{ fontSize: "14px", color: "#1e293b", display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: 1.5 }}>
                <span style={{ color: "#15803d", fontWeight: 700 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Article Body Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", fontSize: "15px", color: "#334155", lineHeight: 1.7 }}>
          {post.contentSections.map((section, idx) => (
            <section key={idx}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                {section.heading}
              </h2>
              {section.body.map((p, pIdx) => (
                <p key={pIdx} style={{ marginBottom: "14px" }}>
                  {p}
                </p>
              ))}
              {section.callout && (
                <div
                  style={{
                    background: "#eff6ff",
                    borderLeft: "4px solid var(--blue, #1f5eff)",
                    padding: "16px 20px",
                    borderRadius: "0 12px 12px 0",
                    margin: "18px 0",
                    fontSize: "14px",
                    color: "#1e40af",
                    fontWeight: 500,
                  }}
                >
                  {section.callout}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Respective Colleges with Photos */}
        <div style={{ marginTop: "40px", borderTop: "1px solid #e2e8f0", paddingTop: "32px" }}>
          <CollegesShowcase
            examSlug={post.examSlug}
            heading={`Target Colleges for ${post.examSlug.toUpperCase()}`}
            subheading="Institutes and degree courses you can aim for by executing this preparation roadmap."
            showFilters={false}
          />
        </div>

        {/* Social Share bottom */}
        <SocialShare title={post.title} url={url} description={post.subtitle} />

        {/* Free Test CTA */}
        <section
          style={{
            background: "linear-gradient(135deg, #071A4D 0%, #1F5EFF 100%)",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            margin: "32px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: "0 0 6px 0" }}>
              Put This Strategy Into Practice
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: "500px" }}>
              Attempt our full-length 50-question mock tests to discover your pacing, errors, and benchmark today.
            </p>
          </div>
          <Link
            href="/free-diagnostic"
            style={{
              background: "#ffffff",
              color: "#071A4D",
              fontWeight: 700,
              padding: "11px 22px",
              borderRadius: "10px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
            }}
          >
            Attempt Free Mock <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </main>
  );
}
