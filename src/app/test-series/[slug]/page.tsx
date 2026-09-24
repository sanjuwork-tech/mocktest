import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import { products, siteConfig } from "@/data/catalog";
import { exams } from "@/data/exams";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { CheckoutButton } from "@/components/CheckoutButton";

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return pageMetadata(
    `${product.title} — Mock Tests & Practice`,
    product.description,
    `/test-series/${slug}`,
    product.keywords,
  );
}

export default async function TestSeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const relatedExam = exams.find((e) => e.slug === slug);
  const otherProducts = products.filter((p) => p.slug !== slug);
  const url = `${siteConfig.url}/test-series/${slug}`;

  const faqs = [
    {
      q: `How many mock tests are included in the ${product.shortName} series?`,
      a: `The ${product.title} includes ${product.mocks} full-length mock tests designed around the latest exam pattern.`,
    },
    {
      q: `What subjects does the ${product.shortName} series cover?`,
      a: `The series covers ${product.pattern}, with detailed analytics and solutions for each subject area.`,
    },
    {
      q: `What is the price of the ${product.shortName} mock test series?`,
      a: `The proposed price is ₹${product.price.toLocaleString("en-IN")}. Final pricing will be confirmed before enrolment opens.`,
    },
    {
      q: `Can I try a free mock test before purchasing?`,
      a: `Yes — one free diagnostic mock is available per subject so you can experience the test format before enrolling.`,
    },
  ];

  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${url}#webpage`,
              url,
              name: product.title,
              description: product.description,
              inLanguage: "en-IN",
              isPartOf: { "@id": `${siteConfig.url}/#website` },
              breadcrumb: { "@id": `${url}#breadcrumb` },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteConfig.url,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Mock test series",
                  item: `${siteConfig.url}/test-series`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.shortName,
                  item: url,
                },
              ],
            },
            {
              "@type": "Product",
              "@id": `${url}#product`,
              name: product.title,
              description: product.description,
              brand: {
                "@type": "Brand",
                name: siteConfig.name,
              },
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price: product.price,
                availability: "https://schema.org/PreOrder",
                priceValidUntil: "2026-12-31",
                seller: { "@id": `${siteConfig.url}/#organization` },
              },
            },
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.a,
                },
              })),
            },
          ],
        }}
      />

      <section className="guide-hero page-shell">
        <nav aria-label="Breadcrumb" className="exam-breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/test-series">Mock test series</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.shortName}</span>
        </nav>
        <p className="eyebrow">
          {product.shortName} · {product.pattern}
        </p>
        <h1>
          {product.title}
          <br />
          <em>{product.subtitle}</em>
        </h1>
        <p className="hero-copy">{product.description}</p>
        <div className="hero-actions">
          {relatedExam && (
            <Link href={`/exams/${slug}`} className="text-link">
              Read the {relatedExam.name} exam guide →
            </Link>
          )}
          <Link href="/test-series#mock-series" className="button-primary">
            Compare all series <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section
        className="page-shell section-space"
        aria-labelledby="series-details-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">What&apos;s in this series</p>
            <h2 id="series-details-title">
              {product.mocks} planned mocks.
              <br />
              Every one built for {product.shortName}.
            </h2>
          </div>
        </div>

        <div className="home-mock-grid" style={{ maxWidth: 640 }}>
          <article className={`home-mock-card theme-${product.slug}`}>
            <span className="card-category">{product.shortName}</span>
            <h3>{product.mocks} planned mocks</h3>
            <p className="home-mock-pattern">{product.pattern}</p>
            <ul>
              {product.features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={16} aria-hidden="true" /> {feature}
                </li>
              ))}
            </ul>
            <div className="home-mock-price">
              <span>Price</span>
              <strong>₹{product.price.toLocaleString("en-IN")}</strong>
            </div>
            {product.compareAtPrice > product.price && (
              <p className="review-note" style={{ marginTop: "0.5rem" }}>
                Compared at ₹{product.compareAtPrice.toLocaleString("en-IN")}
              </p>
            )}
            <div style={{ marginTop: "1.5rem" }}>
              <CheckoutButton 
                productSlug={product.slug}
                priceMinor={product.price * 100}
              />
            </div>
          </article>
        </div>

        <p className="review-note" style={{ marginTop: "2rem" }}>
          Planned offering · Prices, inclusions, test counts and access dates
          are subject to confirmation. Enrolment is not yet open.
        </p>
      </section>

      <section className="how-section">
        <div className="page-shell">
          <p className="eyebrow">How your preparation works</p>
          <h2>
            Each mock should move
            <br />
            your preparation forward.
          </h2>
          <div className="how-grid">
            {[
              {
                Icon: BookOpenCheck,
                number: "01",
                title: "Take a timed mock",
                copy: `Full-length ${product.shortName} mocks matching the latest exam pattern, so you practise the way you'll sit the real test.`,
              },
              {
                Icon: CheckCircle2,
                number: "02",
                title: "Review your answers",
                copy: "Detailed solutions and topic-level analytics help you understand where you went right and where to improve.",
              },
              {
                Icon: ArrowUpRight,
                number: "03",
                title: "Track your progress",
                copy: "See accuracy and speed trends across attempts so you know exactly what to revise before exam day.",
              },
            ].map(({ Icon, number, title, copy }) => (
              <article key={number}>
                <div className="step-top">
                  <Icon size={26} />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-shell section-space"
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Frequently asked questions</p>
            <h2 id="faq-title">
              Questions about the
              <br />
              {product.shortName} series
            </h2>
          </div>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.q} className="faq-item">
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore other mock series</p>
            <h2>
              Different exams.
              <br />
              Different series.
            </h2>
          </div>
        </div>
        <nav className="related-exam-links" aria-label="Other test series">
          {otherProducts.map((other) => (
            <Link
              key={other.slug}
              className="text-link"
              href={`/test-series/${other.slug}`}
            >
              {other.shortName} series →
            </Link>
          ))}
        </nav>
      </section>

      <section className="page-shell section-space">
        <div className="closing-panel">
          <div>
            <p className="eyebrow">Your exam. Your preparation.</p>
            <h2>
              Practice for {product.shortName}
              <br />
              with purpose.
            </h2>
          </div>
          <Link className="button-primary" href="/test-series#mock-series">
            Compare all series <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
