import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { blogPosts } from "@/data/blog";
import { siteConfig } from "@/data/catalog";
import "@/components/guide-page.css";
import "./blog.css";

export const metadata = pageMetadata(
  "CUET, IAT, NEST & COMEDK 2027 Guides",
  "Exam explainers and preparation guides for CUET UG, IISER IAT, NISER NEST and COMEDK UGET — each checked against the official bulletin it cites.",
  "/blog",
);

const byDate = [...blogPosts].sort((a, b) => b.updatedDate.localeCompare(a.updatedDate));

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

export default function BlogIndexPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
            { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/blog` },
          ],
        }}
      />
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
        <nav aria-label="Breadcrumb" className="exam-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Guides</span>
        </nav>
        <h1>
          Exam guides that
          <br />
          <em>cite their sources.</em>
        </h1>
        <p className="hero-copy">
          Explainers and preparation plans for CUET UG, IAT, NEST and COMEDK. Every fact links back to the official
          bulletin it comes from, with no invented cut-offs.
        </p>
      </section>

      <section className="page-shell blog-grid" aria-label="All guides">
        {byDate.map((post) => (
          <article key={post.slug} className="blog-card">
            <p className="blog-card-tags">
              <span className="blog-badge">{post.badge}</span>
              <span>{post.category}</span>
            </p>
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="blog-card-excerpt">{post.description}</p>
            <p className="blog-card-meta">
              Updated <time dateTime={post.updatedDate}>{shortDate(post.updatedDate)}</time> · {post.readTime}
            </p>
            <span className="blog-card-more" aria-hidden="true">
              Read the guide <ArrowRight size={16} />
            </span>
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
