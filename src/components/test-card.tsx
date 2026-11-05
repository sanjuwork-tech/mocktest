import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  type Product,
  bundleSaving,
  formatRupees,
  freeTestHref,
  paymentsEnabled,
} from "@/data/catalog";
import "./test-card.css";

export function TestCard({ product }: { product: Product }) {
  const saving = bundleSaving(product);
  const open = paymentsEnabled();
  return (
    <article
      id={`series-${product.slug}`}
      className={`mock-card theme-${product.slug} ${product.isBundle ? "tc-bundle" : ""}`}
      aria-labelledby={`series-title-${product.slug}`}
    >
      <div className="mock-card-top">
        <div className="tc-tags">
          <span className="card-category">{product.shortName}</span>
          {product.badge && <span className="tc-badge">{product.badge}</span>}
        </div>
        <span className="mock-count">
          <strong>{product.mocks}</strong> planned mocks
        </span>
      </div>
      <h3 id={`series-title-${product.slug}`}>{product.title}</h3>
      <p className="mock-subtitle">{product.subtitle}</p>
      <span className="mock-pattern">{product.pattern}</span>
      <p className="mock-description">{product.description}</p>
      <h4 className="mock-inclusions-title">What you get</h4>
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
          <span className="price-label">
            {open ? "Price" : "Planned price"}
          </span>
          <div className="tc-price-row">
            <strong className="mock-price">{formatRupees(product.price)}</strong>
            {saving && product.compareAtPrice && (
              <span className="tc-compare">
                <span className="sr-only">Bought separately: </span>
                <s>{formatRupees(product.compareAtPrice)}</s>
              </span>
            )}
          </div>
          {saving && (
            <span className="tc-saving">
              Save {formatRupees(saving.amount)} ({saving.percent}%) compared with
              buying these packs separately
            </span>
          )}
        </div>
        <span className="price-context">
          {product.isBundle ? "Multi-exam pass" : "One exam"}
        </span>
      </div>
      <p className="mock-availability">
        {open
          ? "Access details are shown before you pay."
          : "Enrolment opens soon. Price and access details are confirmed when enrolment opens."}
      </p>
      <Link href={freeTestHref(product)} className="button-primary">
        Take free Test 1 <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <Link href={`/test-series/${product.slug}`} className="mock-guide-link">
        {open ? "See details and enrol" : "See series details"}
        <span className="sr-only"> for {product.shortName}</span>
      </Link>
    </article>
  );
}
