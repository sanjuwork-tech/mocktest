"use client";
import { useState } from "react";
import { Search, Sparkles, Layers } from "lucide-react";
import { TestCard } from "@/components/test-card";
import type { Product } from "@/data/catalog";

export function CatalogGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | "single" | "bundle">("all");
  const [exam, setExam] = useState("all");

  const visible = products.filter((product) => {
    // 1. Category filter
    if (category === "single" && product.isBundle) return false;
    if (category === "bundle" && !product.isBundle) return false;

    // 2. Specific exam slug filter
    if (exam !== "all" && product.slug !== exam) return false;

    // 3. Search query filter
    const searchTarget = `${product.title} ${product.shortName} ${product.pattern} ${product.description}`.toLowerCase();
    return searchTarget.includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <label className="search-field">
        <Search size={19} aria-hidden="true" />
        <span className="sr-only">Search mock test series</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find your exam or combo pass (e.g. CUET, IISER, All-Access)…"
        />
      </label>

      {/* Category Tabs: All, Single Exam, Multi-Exam Combos */}
      <div style={{ display: "flex", gap: "8px", margin: "16px 0 12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            setCategory("all");
            setExam("all");
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid",
            background: category === "all" ? "#071A4D" : "#f1f5f9",
            color: category === "all" ? "#fff" : "#475569",
            borderColor: category === "all" ? "#071A4D" : "#cbd5e1",
          }}
        >
          All Offerings ({products.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setCategory("single");
            setExam("all");
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid",
            background: category === "single" ? "#1F5EFF" : "#f1f5f9",
            color: category === "single" ? "#fff" : "#475569",
            borderColor: category === "single" ? "#1F5EFF" : "#cbd5e1",
          }}
        >
          Single Exam Passes
        </button>
        <button
          type="button"
          onClick={() => {
            setCategory("bundle");
            setExam("all");
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid",
            background: category === "bundle" ? "#15803d" : "#f0fdf4",
            color: category === "bundle" ? "#fff" : "#166534",
            borderColor: category === "bundle" ? "#15803d" : "#bbf7d0",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Sparkles size={14} /> Multi-Exam Bundles (Save up to 42%)
        </button>
      </div>

      {/* Individual Exam Filter Row */}
      <div className="filter-row" aria-label="Filter mock series by exam">
        {[{ slug: "all", shortName: "All" }, ...products].map((product) => (
          <button
            key={product.slug}
            type="button"
            aria-pressed={exam === product.slug}
            onClick={() => {
              setExam(product.slug);
              if (product.slug !== "all") {
                setCategory("isBundle" in product && Boolean(product.isBundle) ? "bundle" : "single");
              }
            }}
          >
            {product.shortName}
          </button>
        ))}
      </div>

      <p className="my-4 text-sm" role="status">
        {visible.length} mock test series & combo bundles · Proposed 2026 pricing
      </p>

      <div className="mock-grid">
        {visible.map((product) => (
          <TestCard key={product.id} product={product} />
        ))}
      </div>

      {!visible.length && (
        <div className="empty-state">
          <p>No series match your search.</p>
          <button
            type="button"
            className="button-secondary mt-3"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setExam("all");
            }}
          >
            Show all mock series & bundles
          </button>
        </div>
      )}
    </div>
  );
}
