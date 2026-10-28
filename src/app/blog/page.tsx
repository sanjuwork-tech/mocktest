import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { blogPosts } from "@/data/blog";
import { siteConfig } from "@/data/catalog";

export const metadata = pageMetadata(
  "CUET, IAT, NEST & COMEDK 2027 Guides",
  "Exam explainers and preparation guides for CUET UG, IISER IAT, NISER NEST and COMEDK UGET — each checked against the official bulletin it cites.",
  "/blog",
);

const byDate = [...blogPosts].sort((a, b) => b.updatedDate.localeCompare(a.updatedDate));

export default function BlogIndexPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "OurMocks exam guides",
          url: `${siteConfig.url}/blog`,
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          blogPost: byDate.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: `${siteConfig.url}/blog/${post.slug}`,
            datePublished: post.publishedDate,
            dateModified: post.updatedDate,
          })),
        }}
      />
      <section className="guide-hero page-shell">
        <p className="eyebrow">Guides</p>
        <h1>
          Exam guides that
          <br />
          <em>cite their sources.</em>
        </h1>
        <p className="hero-copy">
          Explainers and preparation plans for CUET UG, IAT, NEST and COMEDK. Every fact links back to the official
          bulletin it comes from — no invented cutoffs or guarantees.
        </p>
      </section>

      <section className="page-shell blog-grid" aria-label="All guides">
        {byDate.map((post) => (
          <article key={post.slug} className="blog-card">
            <div className="blog-meta">
              <span className="blog-badge">{post.badge}</span>
              <span>{post.category}</span>
              <span>
                <Clock size={13} aria-hidden="true" /> {post.readTime}
              </span>
            </div>
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.summary}</p>
            <Link href={`/blog/${post.slug}`} className="text-link" aria-hidden="true" tabIndex={-1}>
              Read the guide <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </section>

      <section className="page-shell section-space">
        <div className="exam-cta-band">
          <div>
            <span className="badge-lime">Free</span>
            <h2>Reading is half of it</h2>
            <p>Take a full CUET paper on the official pattern and see exactly which topics cost you marks.</p>
          </div>
          <Link href="/free-diagnostic" className="button-light">
            Start a free test <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
