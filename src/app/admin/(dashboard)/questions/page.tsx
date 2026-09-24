"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ScientificRenderer,
  type Block,
} from "@/components/ui/scientific-renderer";
import {
  CheckCircle,
  Clock,
  Archive,
  ArrowLeft,
  Filter,
  Check,
  Eye,
  AlertCircle,
} from "lucide-react";

type QuestionItem = {
  revisionId: string;
  questionId: string;
  externalId: string;
  revision: number;
  type: string;
  subject: string;
  topics: string[];
  content: Block[];
  status: "draft" | "in_review" | "approved" | "retired";
  source: { kind: string; reference: string };
  createdAt: string;
  reviewedBy: string | null;
  options: {
    id: string;
    optionKey: string;
    position: number;
    content: Block[];
  }[];
  answer: { correctOptionId: string } | null;
  explanation: Block[] | null;
};

const SUBJECTS = [
  { value: "", label: "All Subjects" },
  { value: "biology", label: "Biology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "english", label: "English" },
  { value: "general-aptitude", label: "General Aptitude" },
];

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "retired", label: "Retired" },
];

export default function QuestionsReviewPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.set("subject", selectedSubject);
      if (selectedStatus) params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load question bank.");
      }
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching questions.");
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestions();
  }, [fetchQuestions]);

  const handleUpdateStatus = async (
    revisionId: string,
    newStatus: "draft" | "in_review" | "approved" | "retired"
  ) => {
    setUpdatingId(revisionId);
    try {
      const res = await fetch(`/api/admin/questions/${revisionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update question status.");
        return;
      }

      setQuestions((prev) =>
        prev.map((q) =>
          q.revisionId === revisionId ? { ...q, status: newStatus } : q
        )
      );
    } catch {
      alert("Network error updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: QuestionItem["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "in_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock size={12} /> In Review
          </span>
        );
      case "retired":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <Archive size={12} /> Retired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

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
            Question Bank & Academic Review
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review and approve imported questions before assembling them into official test blueprints.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/imports" className="button-secondary text-sm">
            Import new questions
          </Link>
          <Link href="/admin/tests" className="button-primary text-sm">
            Test Builder
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
          <Filter size={16} /> Filters:
        </div>
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-xs text-slate-500 font-mono">
          Showing {questions.length} questions
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          Loading question bank...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
          <p className="text-slate-600 font-medium">No questions found matching the selected filters.</p>
          <Link href="/admin/imports" className="button-primary mt-4 inline-block text-sm">
            Import questions via JSON
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const correctOptId = q.answer?.correctOptionId;

            return (
              <div
                key={q.revisionId}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                      #{idx + 1} · {q.externalId}
                    </span>
                    <span className="text-xs capitalize font-semibold text-navy bg-navy/5 px-2 py-0.5 rounded">
                      {q.subject}
                    </span>
                    {q.topics.map((t) => (
                      <span
                        key={t}
                        className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="text-xs text-slate-400">
                      rev {q.revision}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(q.status)}
                    <div className="flex items-center gap-1 ml-2">
                      {q.status !== "approved" && (
                        <button
                          type="button"
                          disabled={updatingId === q.revisionId}
                          onClick={() =>
                            handleUpdateStatus(q.revisionId, "approved")
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Check size={12} /> Approve
                        </button>
                      )}
                      {q.status === "draft" && (
                        <button
                          type="button"
                          disabled={updatingId === q.revisionId}
                          onClick={() =>
                            handleUpdateStatus(q.revisionId, "in_review")
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Eye size={12} /> Mark In Review
                        </button>
                      )}
                      {q.status === "approved" && (
                        <button
                          type="button"
                          disabled={updatingId === q.revisionId}
                          onClick={() =>
                            handleUpdateStatus(q.revisionId, "retired")
                          }
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-200 text-slate-700 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Archive size={12} /> Retire
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Stem */}
                <div className="mb-4">
                  <ScientificRenderer content={q.content} />
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {q.options.map((opt) => {
                    const isCorrect = opt.optionKey === correctOptId;
                    return (
                      <div
                        key={opt.optionKey}
                        className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
                          isCorrect
                            ? "border-emerald-400 bg-emerald-50/50"
                            : "border-slate-200 bg-slate-50/50"
                        }`}
                      >
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {opt.optionKey}
                        </span>
                        <div className="flex-1">
                          <ScientificRenderer content={opt.content} />
                        </div>
                        {isCorrect && (
                          <span className="text-xs font-semibold text-emerald-700 ml-auto">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && q.explanation.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-2">
                      Official Academic Explanation
                    </p>
                    <ScientificRenderer content={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
