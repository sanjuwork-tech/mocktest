"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { BLUEPRINT_PRESETS } from "@/lib/blueprints/definitions";

type Product = {
  id: string;
  slug: string;
  exam: string;
  title: string;
};

export default function NewTestPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("iiser-iat-2026");
  const [title, setTitle] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products.");
        const data = await res.json();
        setProducts(data.products || []);
        if (data.products?.length > 0) {
          // Default to IISER IAT product if found, or first product
          const iat = data.products.find((p: Product) => p.slug.includes("iiser") || p.slug.includes("iat"));
          setSelectedProductId(iat ? iat.id : data.products[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading products.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const blueprint = BLUEPRINT_PRESETS[selectedBlueprintId];

  useEffect(() => {
    if (blueprint) {
      setTitle(`${blueprint.title} — Mock 1`);
    }
  }, [blueprint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedBlueprintId || !title.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          blueprintId: selectedBlueprintId,
          title: title.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create test.");
      }

      router.push(`/admin/tests/${data.testId}/builder`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating test.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">Loading form...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link
        href="/admin/tests"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4"
      >
        <ArrowLeft size={16} /> Back to tests
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Assemble New Mock Test</h1>
        <p className="text-sm text-slate-600 mt-1">
          Choose an official exam blueprint pattern and map it to a preparation product series.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Target Product Series
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-navy focus:outline-none"
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.exam})
              </option>
            ))}
          </select>
        </div>

        {/* Blueprint Preset */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Exam Blueprint Pattern
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(BLUEPRINT_PRESETS).map(([id, bp]) => {
              const isSelected = selectedBlueprintId === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setSelectedBlueprintId(id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-navy bg-navy/5 ring-2 ring-navy/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{bp.examSlug.toUpperCase()}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-navy" />}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{bp.title}</p>
                  <div className="mt-2 flex gap-3 text-[11px] font-mono text-slate-500">
                    <span>{bp.durationMinutes} min</span>
                    <span>•</span>
                    <span>{bp.totalQuestions} questions</span>
                    <span>•</span>
                    <span>{bp.totalMarks} marks</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Blueprint Details Summary */}
        {blueprint && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Blueprint Structure: {blueprint.sections.length} Sections
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {blueprint.sections.map((sec) => (
                <div key={sec.id} className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs">
                  <span className="font-semibold text-slate-800">{sec.name}</span>
                  <div className="text-slate-500 font-mono mt-1">
                    {sec.questionCount} Qs · +{sec.marksPerQuestion}/-{sec.penaltyPerQuestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Test Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-navy focus:outline-none"
            placeholder="e.g. IISER IAT 2026 Full Length Mock Test 1"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Link href="/admin/tests" className="button-secondary text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="button-primary text-sm disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create test & assemble sections"}
          </button>
        </div>
      </form>
    </div>
  );
}
