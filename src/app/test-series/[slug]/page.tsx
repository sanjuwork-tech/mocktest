import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import {
  bundleSaving,
  formatRupees,
  freeTestHref,
  paymentsEnabled,
  products,
  siteConfig,
} from "@/data/catalog";
import { exams } from "@/data/exams";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { CheckoutButton } from "@/components/CheckoutButton";
import { WaitlistForm } from "@/components/waitlist-form";
import "../test-series.css";

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

  const open = paymentsEnabled();
  const saving = bundleSaving(product);
  const parts = (product.includedExams ?? [])
    .map((exam) => products.find((p) => p.slug === exam && !p.isBundle))
    .filter((p) => p !== undefined);

  const faqs = [
    {
      q: `How many mock tests are included in the ${product.shortName} series?`,
      a: product.isBundle
        ? `${product.mocks} full-length mock tests: ${parts.map((p) => `${p.mocks} for ${p.shortName}`).join(", ")}.`
        : `${product.mocks} full-length mock tests. ${product.features[0]}.`,
    },
    {
      q: `What pattern do the ${product.shortName} mocks follow?`,
      a: `${product.pattern}. Each mock is scored with the exam's official marking, and after every test you get worked solutions, time spent per question, and section, topic and difficulty analysis.`,
    },
    {
      q: `What is the price of the ${product.shortName} series?`,
      a: saving && product.compareAtPrice
        ? `${open ? "The price is" : "The planned price is"} ${formatRupees(product.price)}. Bought separately, the included packs cost ${formatRupees(product.compareAtPrice)}, so the bundle saves ${formatRupees(saving.amount)}.${open ? "" : " Price and access details are confirmed when enrolment opens."}`
        : `${open ? "The price is" : "The planned price is"} ${formatRupees(product.price)}.${open ? "" : " Price and access details are confirmed when enrolment opens."}`,
    },
    {
      q: "Can I try a free mock test first?",
      a: "Yes. Test 1 of every exam, and of every CUET subject, is free: a full-length test on the official pattern with the same analysis as paid tests. If Test 1 for your exam isn't open yet, the free tests page lets you ask to be notified.",
    },
    {
      q: "Can I get a refund?",
      a: "Our refund and cancellation policy explains when a refund is possible and how to ask for one. It applies from when paid enrolment opens.",
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
              // No Offer until enrolment is actually open: proposed prices must not appear as a live sale.
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

        <div className="home-mock-grid ts-enrol-card">
          <article className={`home-mock-card theme-${product.slug}${product.isBundle ? " tc-bundle" : ""}`}>
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
              <span>{open ? "Price" : "Planned price"}</span>
              <strong>{formatRupees(product.price)}</strong>
            </div>
            {saving && product.compareAtPrice && (
              <p className="ts-compare">
                Bought separately: <s>{formatRupees(product.compareAtPrice)}</s>.{" "}
                <strong>
                  You save {formatRupees(saving.amount)} ({saving.percent}%).
                </strong>
              </p>
            )}
            <div className="ts-actions">
              {open ? (
                <CheckoutButton
                  productSlug={product.slug}
                  productName={product.title}
                  priceMinor={product.price * 100}
                />
              ) : (
                <p className="ts-status">
                  <strong>Enrolment opens soon</strong>
                  Paid enrolment hasn&apos;t opened yet. Price and access details
                  are confirmed when it opens.
                </p>
              )}
              <Link
                href={freeTestHref(product)}
                className={open ? "button-secondary" : "button-primary"}
              >
                Take free Test 1 <ArrowRight size={16} aria-hidden="true" />
              </Link>
              {!open && (
                <a href="#waitlist" className="text-link">
                  Tell me when enrolment opens
                </a>
              )}
            </div>
          </article>
        </div>

        <p className="review-note ts-note">
          See our{" "}
          <Link href="/refund-policy" className="text-link">
            refund and cancellation policy
          </Link>
          . OurMocks is independent and not affiliated with NTA, IISER, NISER or
          COMEDK.
        </p>
        {!open && (
          <WaitlistForm
            // The waitlist calls the all-access bundle "all-access".
            defaultExam={product.slug === "bundle-all-access" ? "all-access" : product.slug}
            headline="Get told when enrolment opens"
            subheadline={`Leave your email and we'll tell you when paid enrolment opens for ${product.shortName}.`}
            source="test_series_detail"
          />
        )}
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
                copy: `Full-length ${product.shortName} mocks on the official pattern, timing and marking, on an NTA-style test screen.`,
              },
              {
                Icon: CheckCircle2,
                number: "02",
                title: "Review your answers",
                copy: "Worked solutions for every question, with time spent per question and section, topic and difficulty analysis.",
              },
              {
                Icon: ArrowUpRight,
                number: "03",
                title: "See your overall picture",
                copy: "Overall analysis across your tests shows which topics keep costing you marks, so you know what to revise next.",
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
