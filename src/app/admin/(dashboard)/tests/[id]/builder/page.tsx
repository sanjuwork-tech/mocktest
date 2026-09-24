"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter,
  Check,
} from "lucide-react";
import { ScientificRenderer, type Block } from "@/components/ui/scientific-renderer";

type Section = {
  id: string;
  testVersionId: string;
  subject: string;
  position: number;
  rules: {
    id: string;
    name: string;
    required: boolean;
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
};

type QuestionBankItem = {
  revisionId: string;
  questionId: string;
  externalId: string;
  revision: number;
  type: string;
  subject: string;
  topics: string[];
  content: Block[];
  status: "draft" | "in_review" | "approved" | "retired";
};

export default function TestAssemblyBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: testId } = use(params);
  const router = useRouter();

  const [test, setTest] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  // Question bank picker state
  const [availableQuestions, setAvailableQuestions] = useState<QuestionBankItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load test details and assignments
  const loadTest = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/tests/${testId}`);
      if (!res.ok) throw new Error("Failed to load test.");
      const data = await res.json();
      setTest(data.test);
      setSections(data.sections || []);
      setAssignments(data.assignments || []);
      if (data.sections?.length > 0 && !activeSectionId) {
        setActiveSectionId(data.sections[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading test.");
    } finally {
      setLoading(false);
    }
  }, [testId, activeSectionId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  // Load approved questions from bank for active section's subject
  const activeSection = sections.find((s) => s.id === activeSectionId);

  const loadQuestionsForSection = useCallback(async () => {
    if (!activeSection) return;
    setLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      params.set("subject", activeSection.subject);
      params.set("status", "approved"); // only approved questions
      if (questionSearch) params.set("search", questionSearch);

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load questions.");
      const data = await res.json();
      setAvailableQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  }, [activeSection, questionSearch]);

  useEffect(() => {
    if (activeSection) {
      loadQuestionsForSection();
    }
  }, [activeSection, loadQuestionsForSection]);

  const handleAssignQuestion = (q: QuestionBankItem) => {
    if (!activeSection) return;
    // Check if already assigned
    if (assignments.some((a) => a.revisionId === q.revisionId)) {
      alert("This question is already assigned to this test.");
      return;
    }

    const currentSecAssignments = assignments.filter(
      (a) => a.sectionId === activeSection.id
    );

    const newAssignment: Assignment = {
      sectionId: activeSection.id,
      revisionId: q.revisionId,
      position: currentSecAssignments.length,
      marks: activeSection.rules.marksPerQuestion,
      penalty: activeSection.rules.penaltyPerQuestion,
      externalId: q.externalId,
      subject: q.subject,
      status: q.status,
      content: q.content,
    };

    setAssignments((prev) => [...prev, newAssignment]);
  };

  const handleRemoveAssignment = (revisionId: string) => {
    setAssignments((prev) => prev.filter((a) => a.revisionId !== revisionId));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const payload = assignments.map((a, idx) => ({
        sectionId: a.sectionId,
        revisionId: a.revisionId,
        position: idx,
        marks: a.marks,
        penalty: a.penalty,
      }));

      const res = await fetch(`/api/admin/tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft.");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving draft.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-12 text-center text-slate-500">Loading builder...</div>;
  }

  const currentAssignments = assignments.filter(
    (a) => a.sectionId === activeSectionId
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/admin/tests"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 mb-2"
          >
            <ArrowLeft size={16} /> Back to tests
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{test?.title}</h1>
            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-navy/5 text-navy">
              {test?.exam}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total assigned: {assignments.length} questions · {test?.durationMinutes} minutes · {test?.totalMarks} marks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check size={14} /> Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="button-secondary text-sm flex items-center gap-2"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save draft"}
          </button>
          <Link
            href={`/admin/tests/${testId}/preview`}
            className="button-primary text-sm flex items-center gap-2"
          >
            <Eye size={16} /> Preview & Publish
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        {sections.map((sec) => {
          const count = assignments.filter((a) => a.sectionId === sec.id).length;
          const required = sec.rules.questionCount;
          const isComplete = count === required;
          const isActive = sec.id === activeSectionId;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSectionId(sec.id)}
              className={`px-4 py-2.5 font-medium text-sm rounded-t-xl border-t border-x transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-white border-slate-200 text-navy font-bold shadow-sm"
                  : "bg-slate-50 border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{sec.rules.name || sec.subject}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                  isComplete
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {count} / {required}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Assembly Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current Section Assignments (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900">
              Assigned to {activeSection?.rules.name} ({currentAssignments.length} / {activeSection?.rules.questionCount})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              +{activeSection?.rules.marksPerQuestion} / -{activeSection?.rules.penaltyPerQuestion} per question
            </span>
          </div>

          {currentAssignments.length === 0 ? (
            <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-xl">
              <p className="text-slate-500 text-sm">No questions assigned to this section yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Pick questions from the approved question bank on the right.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentAssignments.map((a, idx) => (
                <div
                  key={a.revisionId}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      Q{idx + 1} · {a.externalId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignment(a.revisionId)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-sm">
                    <ScientificRenderer content={a.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Available Approved Question Bank (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col h-[750px]">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Approved {activeSection?.rules.name} Questions
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search external ID or topic..."
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loadingQuestions ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading approved questions...</div>
            ) : availableQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No approved questions found for {activeSection?.subject}.
                <div className="mt-2">
                  <Link href="/admin/questions" className="text-navy font-semibold hover:underline">
                    Review and approve questions &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              availableQuestions.map((q) => {
                const isAssigned = assignments.some((a) => a.revisionId === q.revisionId);
                return (
                  <div
                    key={q.revisionId}
                    className={`p-3 rounded-lg border text-xs bg-white transition-all ${
                      isAssigned
                        ? "border-slate-200 opacity-60 bg-slate-100"
                        : "border-slate-200 hover:border-navy shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-slate-800">{q.externalId}</span>
                      {isAssigned ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Assigned
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAssignQuestion(q)}
                          className="px-2 py-1 bg-navy text-white rounded font-medium hover:bg-navy/90 flex items-center gap-1 text-[11px]"
                        >
                          <Plus size={12} /> Assign
                        </button>
                      )}
                    </div>
                    <div className="line-clamp-2 text-slate-700">
                      <ScientificRenderer content={q.content} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
