"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { TestCard } from "@/components/test-card";
import type { Product } from "@/data/catalog";

export function CatalogGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => products.filter(product => (filter === "all" || product.slug === filter) && `${product.title} ${product.description}`.toLowerCase().includes(query.toLowerCase())), [filter, query, products]);
  const filters = [["all", "All tests"], ...products.map(product => [product.slug, product.shortName])];
  return <div><div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div className="flex gap-2 overflow-x-auto pb-1">{filters.map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-bold transition ${filter === value ? "border-navy bg-navy text-white" : "border-navy/15 bg-transparent text-navy/55 hover:bg-white"}`}>{label}</button>)}</div><label className="flex min-w-0 items-center gap-2 rounded-full border border-navy/15 bg-white/60 px-4 py-3 lg:min-w-[290px]"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} className="w-full bg-transparent text-xs outline-none" placeholder="Search a test series…" /></label></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map(product => <TestCard key={product.id} product={product} />)}</div>{!visible.length && <div className="rounded-3xl border border-dashed border-navy/20 py-20 text-center text-sm text-navy/50">No test series match your search.</div>}</div>;
}
