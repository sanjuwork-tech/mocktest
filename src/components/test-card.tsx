import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { type Product, siteConfig } from "@/data/catalog";

export function TestCard({ product }: { product: Product }) {
  const subject = encodeURIComponent(
    `Enquiry: ${product.shortName} mock test series`,
  );
  return (
    <article
      id={`series-${product.slug}`}
      className={`mock-card theme-${product.slug} ${product.isBundle ? "bundle-card" : ""}`}
      aria-labelledby={`series-title-${product.slug}`}
    >
      <div className="mock-card-top">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="card-category">{product.shortName}</span>
          {product.badge && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: "rgba(184, 255, 52, 0.2)",
                color: "#15803d",
                padding: "2px 8px",
                borderRadius: "999px",
                border: "1px solid rgba(184, 255, 52, 0.5)",
              }}
            >
              {product.badge}
            </span>
          )}
        </div>
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
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <strong className="mock-price">
              ₹{product.price.toLocaleString("en-IN")}
            </strong>
            {product.compareAtPrice > product.price && (
              <span style={{ textDecoration: "line-through", color: "#64748b", fontSize: "14px" }}>
                ₹{product.compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {product.savingsText && (
            <span
              style={{
                display: "inline-block",
                fontSize: "12px",
                color: "#16a34a",
                fontWeight: "700",
                marginTop: "3px",
              }}
            >
              {product.savingsText}
            </span>
          )}
        </div>
        <span className="price-context">
          {product.isBundle ? (
            <>
              Multi-exam
              <br />
              combo pass
            </>
          ) : (
            <>
              For this exam’s
              <br />
              planned series
            </>
          )}
        </span>
      </div>
      <p className="mock-availability">
        Price, final test count, inclusions and access validity will be
        confirmed before enrolment opens.
      </p>
      <Link
        href="/free-diagnostic"
        className="button-primary"
      >
        {product.slug === "cuet-ug"
          ? "Attempt Free Full Test"
          : product.isBundle
            ? "Join Priority Waitlist"
            : "Coming Soon — Notify Me"}{" "}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <Link href={product.isBundle ? "/test-series" : `/exams#${product.slug}`} className="mock-guide-link">
        {product.isBundle ? "Compare all included exams ↗" : "Check eligibility & exam details ↗"}
      </Link>
    </article>
  );
}
