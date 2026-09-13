import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { type Product, siteConfig } from "@/data/catalog";

export function TestCard({ product }: { product: Product }) {
  const subject = encodeURIComponent(
    `Enquiry: ${product.shortName} mock test series`,
  );
  return (
    <article
      id={`series-${product.slug}`}
      className={`mock-card theme-${product.slug}`}
      aria-labelledby={`series-title-${product.slug}`}
    >
      <div className="mock-card-top">
        <span className="card-category">{product.shortName}</span>
        <span className="mock-count">
          <strong>{product.mocks}</strong> planned mocks
        </span>
      </div>
      <h3 id={`series-title-${product.slug}`}>
        {product.title.replace(/ 2026$/, "")}
      </h3>
      <p className="mock-subtitle">{product.subtitle}</p>
      <span className="mock-pattern">{product.pattern}</span>
      <p className="mock-description">{product.description}</p>
      <h4 className="mock-inclusions-title">Planned inclusions</h4>
      <ul className="mock-inclusions">
        {product.features.map((feature) => (
          <li key={feature}>
            <Check size={16} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mock-price-block">
        <div>
          <span className="price-label">Proposed series price</span>
          <strong className="mock-price">
            ₹{product.price.toLocaleString("en-IN")}
          </strong>
        </div>
        <span className="price-context">
          For this exam’s
          <br />
          planned series
        </span>
      </div>
      <p className="mock-availability">
        Price, final test count, inclusions and access validity will be
        confirmed before enrolment opens.
      </p>
      <a
        href={`mailto:${siteConfig.email}?subject=${subject}`}
        className="button-primary"
      >
        Ask about {product.shortName}{" "}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
      <Link href={`/exams#${product.slug}`} className="mock-guide-link">
        Check eligibility & exam details ↗
      </Link>
    </article>
  );
}
