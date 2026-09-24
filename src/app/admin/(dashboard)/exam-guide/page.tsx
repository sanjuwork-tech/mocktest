"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Check,
} from "lucide-react";
import type { ExamGuide } from "@/data/exams";

export default function ExamGuideEditorialPage() {
  const [guides, setGuides] = useState<ExamGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuides() {
      try {
        const res = await fetch("/api/admin/exam-guide");
        if (!res.ok) throw new Error("Failed to load exam guides.");
        const data = await res.json();
        setGuides(data.guides || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading guides.");
      } finally {
        setLoading(false);
      }
    }
    loadGuides();
  }, []);

  const handleUpdate = async (
    slug: string,
    updates: Partial<ExamGuide>
  ) => {
    setSavingSlug(slug);
    setSuccessSlug(null);
    try {
      const res = await fetch("/api/admin/exam-guide", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update guide.");

      setGuides((prev) =>
        prev.map((g) => (g.slug === slug ? { ...g, ...updates } : g))
      );
      setSuccessSlug(slug);
      setTimeout(() => setSuccessSlug(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating guide.");
    } finally {
      setSavingSlug(null);
    }
  };

  const markReviewedToday = (slug: string) => {
    const today = new Date().toISOString().split("T")[0];
    handleUpdate(slug, {
      checkedOn: today,
      verification: "reviewed",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Exam Guide Editorial Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review official exam notices, cycle dates, and verify freshness to prevent stale public information.
          </p>
        </div>
        <Link href="/exams" target="_blank" className="button-secondary text-sm flex items-center gap-1">
          <ExternalLink size={14} /> View public Explore Exams
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading exam guides...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {guides.map((g) => {
            const isSaving = savingSlug === g.slug;
            const isSuccess = successSlug === g.slug;

            return (
              <div
                key={g.slug}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{g.name}</h3>
                    <p className="text-xs text-slate-500">{g.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        g.verification === "reviewed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {g.verification === "reviewed" ? "Reviewed" : "Partial Review"}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Last checked: {g.checkedOn}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Notification */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Active Notification
                    </span>
                    <p className="font-semibold text-slate-900 mt-1">{g.notification.title}</p>
                    <p className="text-slate-600 mt-0.5">{g.notification.detail}</p>
                    <a
                      href={g.notification.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy hover:underline font-medium mt-2 inline-flex items-center gap-1"
                    >
                      Source: {g.notification.source.label} <ExternalLink size={10} />
                    </a>
                  </div>

                  {/* Application Status */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Application Portal Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-slate-800 uppercase">
                        {g.application.status}
                      </span>
                      <span>·</span>
                      <span className="text-slate-600">{g.application.label}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">{g.application.note}</p>
                    <a
                      href={g.application.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy hover:underline font-medium mt-2 inline-flex items-center gap-1"
                    >
                      Portal Link <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div>
                    {isSuccess && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check size={14} /> Review freshness updated!
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => markReviewedToday(g.slug)}
                    className="button-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Calendar size={14} />
                    {isSaving ? "Updating..." : "Mark verified today"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
