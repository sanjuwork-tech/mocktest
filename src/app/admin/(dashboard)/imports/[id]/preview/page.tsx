"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScientificRenderer, type Block } from "@/components/ui/scientific-renderer";
import { CheckCircle2, AlertCircle, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ImportQuestion {
  externalId: string;
  type: string;
  subject: string;
  topics?: string[];
  content: Block[];
  options?: { key: string; content: Block[] }[];
  answer?: string | string[];
  explanation?: Block[];
  marks?: number;
  penalty?: number;
}

interface ImportData {
  title?: string;
  language?: string;
  bundleId?: string;
  questions: ImportQuestion[];
}

export default function ImportPreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<ImportData | null>(null);
  const [error, setError] = useState("");
  const [committing, setCommitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    const raw = sessionStorage.getItem(`import_${id}`);
    if (!raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Import data not found in session storage. Please upload the file again.");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      setError("Failed to parse import data.");
    }
  }, [id]);

  const handleCommit = async () => {
    if (!data) return;
    setCommitting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/imports/${id}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Failed to commit import.");
        return;
      }

      setSuccess(true);
      sessionStorage.removeItem(`import_${id}`);
    } catch {
      setError("An unexpected error occurred while committing.");
    } finally {
      setCommitting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 text-red-900 p-6 rounded-xl border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-lg font-bold">Error</h2>
          </div>
          <p>{error}</p>
          <Link href="/admin/imports" className="mt-4 inline-flex items-center gap-2 text-red-700 hover:underline font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Upload
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 text-green-900 p-8 rounded-xl border border-green-200 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Import Successful!</h2>
          <p className="mb-6">Your question bank has been successfully committed to the database.</p>
          <Link href="/admin/imports" className="button-primary inline-block">
            Import Another File
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-center text-slate-500">Loading preview...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/imports" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Preview Question Bank</h1>
          </div>
          <p className="text-slate-600 pl-8">
            Review the formatting of your {data.questions.length} questions before saving.
          </p>
        </div>
        <button
          onClick={handleCommit}
          disabled={committing}
          className="button-primary flex items-center gap-2 px-6"
        >
          <Save className="h-4 w-4" />
          {committing ? "Saving..." : "Commit to Database"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-lg">{data.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
            <span className="bg-slate-200 px-2 py-1 rounded text-xs font-semibold uppercase">{data.language}</span>
            <span>Bundle ID: {data.bundleId}</span>
            <span>{data.questions.length} Questions</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {data.questions.map((q: any, i: number) => (
            <div key={q.externalId} className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-400">Question {i + 1}</span>
                <div className="flex gap-2">
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {q.subject}
                  </span>
                  <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    {q.difficulty}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <ScientificRenderer content={q.stem as Block[]} />
              </div>

              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {q.options.map((opt: any, j: number) => {
                  const isCorrect = opt.id === q.answer.correctOptionId;
                  return (
                    <div
                      key={opt.id}
                      className={`flex gap-4 p-4 rounded-xl border ${
                        isCorrect ? "bg-green-50 border-green-200" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                        isCorrect ? "bg-green-200 text-green-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {String.fromCharCode(65 + j)}
                      </div>
                      <div className="flex-1 mt-1">
                        <ScientificRenderer content={opt.content as Block[]} />
                      </div>
                      {isCorrect && (
                        <div className="shrink-0 text-green-600 self-center">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Explanation</h4>
                <ScientificRenderer content={q.explanation as Block[]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
