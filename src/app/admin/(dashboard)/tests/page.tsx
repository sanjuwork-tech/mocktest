"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  ArrowLeft,
  CheckCircle,
  Clock,
  ExternalLink,
  BookOpen,
} from "lucide-react";

type TestItem = {
  id: string;
  productId: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  published: boolean;
  createdAt: string;
  productTitle: string;
  productSlug: string;
  exam: string;
  versionsCount: number;
  publishedVersionsCount: number;
  latestVersion: number;
  isLatestPublished: boolean;
};

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await fetch("/api/admin/tests");
        if (!res.ok) throw new Error("Failed to load tests.");
        const data = await res.json();
        setTests(data.tests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading tests.");
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 mb-2"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Test Builder & Exam Publishing
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Assemble, validate, preview and publish official immutable mock test versions from approved questions.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/questions" className="button-secondary text-sm flex items-center gap-2">
            <BookOpen size={16} />
            Question bank review
          </Link>
          <Link href="/admin/tests/new" className="button-primary text-sm flex items-center gap-2">
            <Plus size={16} />
            Assemble new test
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading tests...</div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          {error}
        </div>
      ) : tests.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
          <Layers size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No mock tests configured yet</h3>
          <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
            Get started by assembling a test from approved question bank items according to an official exam blueprint.
          </p>
          <Link href="/admin/tests/new" className="button-primary mt-4 inline-flex items-center gap-2 text-sm">
            <Plus size={16} /> Assemble first test
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tests.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy/5 text-navy">
                    {t.exam}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                  {t.published ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <CheckCircle size={12} /> Published (v{t.latestVersion})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      <Clock size={12} /> Draft
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span>Product: {t.productTitle}</span>
                  <span>•</span>
                  <span>Duration: {t.durationMinutes} min</span>
                  <span>•</span>
                  <span>Total Marks: {t.totalMarks}</span>
                  <span>•</span>
                  <span>Versions: {t.versionsCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/tests/${t.id}/builder`}
                  className="button-secondary text-xs"
                >
                  Edit sections
                </Link>
                <Link
                  href={`/admin/tests/${t.id}/preview`}
                  className="button-primary text-xs flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  Preview & publish
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
