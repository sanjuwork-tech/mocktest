import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, CheckCircle2, Clock } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { blogPosts, getBlogPost } from "@/data/blog";
import { siteConfig } from "@/data/catalog";
import { exams } from "@/data/exams";
import { SocialShare } from "@/components/social-share";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  return pageMetadata(post.metaTitle, post.description, `/blog/${slug}`, undefined, {
    publishedTime: post.publishedDate,
    modifiedTime: post.updatedDate,
    section: post.category,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const url = `${siteConfig.url}/blog/${slug}`;
  const exam = exams.find((e) => e.slug === post.examSlug)!;
  const freeTestLive = post.examSlug === "cuet-ug";
  const related = blogPosts.filter(
    (p) => p.slug !== slug && p.relatedExams.some((e) => post.relatedExams.includes(e)),
  );

  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${url}#article`,
              headline: post.title,
              description: post.description,
              url,
              mainEntityOfPage: url,
              image: `${siteConfig.url}/brand-share.png`,
              inLanguage: "en-IN",
              datePublished: post.publishedDate,
              dateModified: post.updatedDate,
              articleSection: post.category,
              author: { "@type": "Organization", name: post.author, url: `${siteConfig.url}/about` },
              publisher: {
                "@type": "Organization",
                name: siteConfig.name,
                url: siteConfig.url,
                logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo-mark.png` },
              },
              citation: post.sources.map((s) => s.url),
              about: { "@type": "Thing", name: exam.fullName },
            },
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: post.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
                { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/blog` },
                { "@type": "ListItem", position: 3, name: post.title, item: url },
              ],
            },
          ],
        }}
      />

      <article className="blog-article">
        <Link href="/blog" className="text-link blog-back">
          <ArrowLeft size={15} /> All guides
        </Link>

        <div className="blog-meta">
          <span className="blog-badge">{post.badge}</span>
          <span>
            <Calendar size={13} aria-hidden="true" /> Updated{" "}
            <time dateTime={post.updatedDate}>{formatDate(post.updatedDate)}</time>
          </span>
          <span>
            <Clock size={13} aria-hidden="true" /> {post.readTime}
          </span>
        </div>

        <h1>{post.title}</h1>
        <p className="blog-lede">{post.subtitle}</p>
        <p className="blog-byline">
          {post.author} · {post.authorRole}
        </p>

        <section className="blog-summary" aria-labelledby="summary-title">
          <h2 id="summary-title">In short</h2>
          <p>{post.summary}</p>
          <ul>
            {post.keyTakeaways.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="blog-body">
          {post.contentSections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.callout && <p className="blog-callout">{section.callout}</p>}
            </section>
          ))}

          <section className="exam-faqs" aria-labelledby="faq-title">
            <h2 id="faq-title">Frequently asked questions</h2>
            {post.faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </section>

          <section className="blog-sources" aria-labelledby="sources-title">
            <h2 id="sources-title">Sources</h2>
            <ul>
              {post.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.label} <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
            <p>
              Published <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>. Exam rules change
              between cycles — the official bulletin always takes precedence.
            </p>
          </section>
        </div>

        <section className="exam-cta-band">
          <div>
            <span className="badge-lime">{exam.name}</span>
            <h2>{freeTestLive ? "Put this into practice" : `Practise ${exam.name} when mocks open`}</h2>
            <p>
              {freeTestLive
                ? "Take a full CUET paper on the official pattern, free, and get a section and topic breakdown."
                : `Read the full ${exam.name} guide, and join the waitlist to hear when our mocks open.`}
            </p>
          </div>
          <Link href={freeTestLive ? "/free-diagnostic" : `/free-diagnostic?exam=${exam.slug}#waitlist`} className="button-light">
            {freeTestLive ? "Start a free test" : "Join the waitlist"} <ArrowRight size={15} />
          </Link>
        </section>

        <nav className="blog-related" aria-label="Related reading">
          <h2>Keep reading</h2>
          <ul>
            <li>
              <Link href={`/exams/${exam.slug}`}>{exam.name} 2027 exam guide: pattern, eligibility &amp; dates</Link>
            </li>
            {related.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
            <li>
              <Link href="/colleges">Institutes that admit through {exam.name}</Link>
            </li>
          </ul>
        </nav>

        <SocialShare title={post.title} url={url} description={post.description} />
      </article>
    </main>
  );
}
