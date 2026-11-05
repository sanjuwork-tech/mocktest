"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { TestCard } from "@/components/test-card";
import { bundleSaving, type Product } from "@/data/catalog";
import "./test-card.css";

type Category = "all" | "single" | "bundle";

export function CatalogGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [exam, setExam] = useState("all");

  const bestSaving = Math.max(0, ...products.map((p) => bundleSaving(p)?.percent ?? 0));

  const visible = products.filter((product) => {
    if (category === "single" && product.isBundle) return false;
    if (category === "bundle" && !product.isBundle) return false;
    if (exam !== "all" && product.slug !== exam) return false;
    const searchTarget = `${product.title} ${product.shortName} ${product.pattern} ${product.description}`.toLowerCase();
    return searchTarget.includes(query.trim().toLowerCase());
  });

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: `All (${products.length})` },
    { id: "single", label: "Single exam" },
    {
      id: "bundle",
      label: bestSaving ? `Multi-exam bundles (save up to ${bestSaving}%)` : "Multi-exam bundles",
    },
  ];

  return (
    <div>
      <label className="search-field">
        <Search size={19} aria-hidden="true" />
        <span className="sr-only">Search mock test series</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find your exam or bundle (e.g. CUET, IISER, All-Access)…"
        />
      </label>

      <div className="tc-filters" role="group" aria-label="Show single exams or bundles">
        {categories.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={category === id}
            onClick={() => {
              setCategory(id);
              setExam("all");
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filter-row" role="group" aria-label="Filter mock series by exam">
        {[{ slug: "all", shortName: "All", isBundle: false }, ...products].map((product) => (
          <button
            key={product.slug}
            type="button"
            aria-pressed={exam === product.slug}
            onClick={() => {
              setExam(product.slug);
              if (product.slug !== "all") setCategory(product.isBundle ? "bundle" : "single");
            }}
          >
            {product.shortName}
          </button>
        ))}
      </div>

      <p className="my-4 text-sm" role="status">
        {visible.length} test series and bundles for the 2027 admission cycle
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
            Show all series and bundles
          </button>
        </div>
      )}
    </div>
  );
}
