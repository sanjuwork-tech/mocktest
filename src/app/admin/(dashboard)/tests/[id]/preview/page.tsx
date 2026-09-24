"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

import { CheckCircle2, AlertTriangle, Send, Timer } from "lucide-react";
import { ScientificRenderer, type Block } from "@/components/ui/scientific-renderer";

type Section = {
  id: string;
  testVersionId: string;
  subject: string;
  position: number;
  rules: {
    id: string;
    name: string;
    questionCount: number;
    marksPerQuestion: number;
    penaltyPerQuestion: number;
  };
};

type Assignment = {
  id?: string;
  sectionId: string;
  revisionId: string;
  position: number;
  marks: number;
  penalty: number;
  externalId: string;
  subject: string;
  status: string;
  content: Block[];
  options: {
    id: string;
    optionKey: string;
    position: number;
    content: Block[];
  }[];
  answer: { correctOptionId: string } | null;
  explanation: Block[] | null;
};

export default function StudentExperiencePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: testId } = use(params);

interface TestPreviewData {
  title: string;
  exam: string;
  durationMinutes: number;
  totalMarks: number;
}

interface TestVersionData {
  version?: number;
  publishedAt?: string | null;
}

  const [test, setTest] = useState<TestPreviewData | null>(null);
  const [version, setVersion] = useState<TestVersionData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Simulator student interaction state
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // Publishing action state
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/tests/${testId}`);
        if (!res.ok) throw new Error("Failed to load test preview.");
        const data = await res.json();
        setTest(data.test);
        setVersion(data.version);
        setSections(data.sections || []);
        setAssignments(data.assignments || []);
        if (data.sections?.length > 0) {
          setActiveSectionId(data.sections[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading preview.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [testId]);

  const currentSection = sections.find((s) => s.id === activeSectionId);
  const currentSectionAssignments = assignments.filter(
    (a) => a.sectionId === activeSectionId
  );
  const currentQuestion = currentSectionAssignments[activeQuestionIndex];

  // Client-side validation checks
  const validationErrors: string[] = [];
  if (sections.length === 0) {
    validationErrors.push("No sections configured.");
  }
  for (const sec of sections) {
    const count = assignments.filter((a) => a.sectionId === sec.id).length;
    const req = sec.rules?.questionCount || 0;
    if (count !== req) {
      validationErrors.push(`Section "${sec.rules?.name || sec.subject}" has ${count}/${req} questions.`);
    }
  }
  const unapproved = assignments.filter((a) => a.status !== "approved");
  if (unapproved.length > 0) {
    validationErrors.push(`${unapproved.length} assigned question(s) are not approved.`);
  }
  const totalAssignedMarks = assignments.reduce((acc, curr) => acc + curr.marks, 0);
  if (test && totalAssignedMarks !== test.totalMarks) {
    validationErrors.push(`Total marks mismatch: Assigned ${totalAssignedMarks} / Required ${test.totalMarks}.`);
  }

  const isPublishable = validationErrors.length === 0 && !version?.publishedAt;

  const handlePublish = async () => {
    if (!isPublishable) return;
    setPublishing(true);
    setPublishErrors([]);

    try {
      const res = await fetch(`/api/admin/tests/${testId}/publish`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishErrors(data.details || [data.error || "Publication failed."]);
        return;
      }

      setPublishSuccess(true);
      // Reload test info
      const refreshRes = await fetch(`/api/admin/tests/${testId}`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setTest(refreshData.test);
        setVersion(refreshData.version);
      }
    } catch {
      setPublishErrors(["An unexpected network error occurred while publishing."]);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading student experience preview...</div>;
  }

  if (error || !test) {
    return <div className="p-6 text-center text-rose-600">{error || "Test not found."}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Banner */}
      <div className="bg-navy text-white px-6 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
            Admin Preview Simulator
          </span>
          <span>Viewing full student exam environment for {test.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/tests/${testId}/builder`}
            className="text-slate-300 hover:text-white underline"
          >
            Edit sections in builder
          </Link>
          <Link href="/admin/tests" className="text-slate-300 hover:text-white">
            Exit preview
          </Link>
        </div>
      </div>

      {/* Student Test Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{test.title}</h2>
          <p className="text-xs text-slate-500">
            {test.exam.toUpperCase()} · Marking Scheme: +{currentSection?.rules?.marksPerQuestion} / -{currentSection?.rules?.penaltyPerQuestion}
          </p>
        </div>

        {/* Student Timer Simulator */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-lg text-amber-900 font-mono font-bold text-sm">
          <Timer size={18} className="text-amber-600" />
          <span>{test.durationMinutes}:00 Remaining</span>
        </div>
      </header>

      {/* Section Tabs Bar */}
      <div className="bg-slate-200/70 border-b border-slate-300 px-6 flex gap-1 overflow-x-auto">
        {sections.map((sec) => {
          const isActive = sec.id === activeSectionId;
          const count = assignments.filter((a) => a.sectionId === sec.id).length;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setActiveSectionId(sec.id);
                setActiveQuestionIndex(0);
              }}
              className={`px-5 py-2.5 font-semibold text-sm transition-all border-b-2 ${
                isActive
                  ? "bg-white text-navy border-navy shadow-sm"
                  : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
            >
              {sec.rules?.name || sec.subject} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Student Workspace (Question + Palette) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-28">
        {/* Left: Question Area (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          {currentQuestion ? (
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="font-bold text-slate-800 text-sm">
                  Question {activeQuestionIndex + 1} of {currentSectionAssignments.length}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  +{currentQuestion.marks} / -{currentQuestion.penalty} Marks · {currentQuestion.externalId}
                </span>
              </div>

              {/* Question Content */}
              <div className="mb-6 text-slate-900 text-base leading-relaxed">
                <ScientificRenderer content={currentQuestion.content} />
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQuestion.revisionId] === opt.optionKey;
                  const isCorrect = currentQuestion.answer?.correctOptionId === opt.optionKey;

                  return (
                    <button
                      key={opt.optionKey}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.revisionId]: opt.optionKey,
                        }))
                      }
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-navy bg-navy/5 ring-2 ring-navy/20 font-medium"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span
                        className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                          isSelected ? "bg-navy text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <div className="flex-1 text-sm">
                        <ScientificRenderer content={opt.content} />
                      </div>
                      {/* Admin hint badge */}
                      {isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Official Key
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Simulator Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={activeQuestionIndex === 0}
                  onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
                  className="button-secondary text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const copy = { ...selectedAnswers };
                      delete copy[currentQuestion.revisionId];
                      setSelectedAnswers(copy);
                    }}
                    className="button-secondary text-xs"
                  >
                    Clear response
                  </button>
                  <button
                    type="button"
                    disabled={activeQuestionIndex === currentSectionAssignments.length - 1}
                    onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                    className="button-primary text-sm disabled:opacity-40"
                  >
                    Save & Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              No questions assigned to this section yet.
            </div>
          )}
        </div>

        {/* Right: Question Palette (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Question Palette · {currentSection?.rules?.name}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {currentSectionAssignments.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.revisionId]);
              const isCurrent = idx === activeQuestionIndex;

              return (
                <button
                  key={q.revisionId}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`h-10 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? "ring-2 ring-navy ring-offset-2 bg-navy text-white"
                      : isAnswered
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" /> Unanswered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-navy" /> Current Question
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Admin Publishing Gate Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-300 shadow-2xl p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900">
                Academic & Blueprint Verification Gate
              </h4>
              {version?.publishedAt ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={12} /> Published (v{version.version})
                </span>
              ) : isPublishable ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={12} /> Ready for publication
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                  <AlertTriangle size={12} /> Validation pending ({validationErrors.length} issues)
                </span>
              )}
            </div>

            {validationErrors.length > 0 && !version?.publishedAt && (
              <p className="text-xs text-rose-600 mt-1">
                {validationErrors.join(" · ")}
              </p>
            )}

            {publishErrors.length > 0 && (
              <div className="text-xs text-rose-700 mt-1 font-semibold">
                Publication error: {publishErrors.join(", ")}
              </div>
            )}

            {publishSuccess && (
              <p className="text-xs text-emerald-600 font-bold mt-1">
                Test successfully published! Catalog inventory has been updated.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/tests/${testId}/builder`}
              className="button-secondary text-sm"
            >
              Back to builder
            </Link>

            {!version?.publishedAt && (
              <button
                type="button"
                disabled={!isPublishable || publishing}
                onClick={handlePublish}
                className="button-primary text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                {publishing ? "Publishing snapshot..." : "Publish official test version"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
