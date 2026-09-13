"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { TestCard } from "@/components/test-card";
import type { Product } from "@/data/catalog";
export function CatalogGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [exam, setExam] = useState("all");
  const visible = products.filter(
    (product) =>
      (exam === "all" || product.slug === exam) &&
      `${product.title} ${product.shortName} ${product.pattern}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div>
      <label className="search-field">
        <Search size={19} aria-hidden="true" />
        <span className="sr-only">Search mock test series</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find your exam’s mock test series…"
        />
      </label>
      <div className="filter-row" aria-label="Filter mock series by exam">
        {[{ slug: "all", shortName: "All exams" }, ...products].map(
          (product) => (
            <button
              key={product.slug}
              type="button"
              aria-pressed={exam === product.slug}
              onClick={() => setExam(product.slug)}
            >
              {product.shortName}
            </button>
          ),
        )}
      </div>
      <p className="my-4 text-sm" role="status">
        {visible.length} mock test series · Proposed pricing
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
              setExam("all");
            }}
          >
            Show all mock series
          </button>
        </div>
      )}
    </div>
  );
}
