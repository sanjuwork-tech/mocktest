"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, FileJson, UploadCloud } from "lucide-react";
import { EXAMS, SUBJECT_NAMES, isExamSlug, isSubjectId } from "@/lib/exams/catalog";

type Issue = { path: string; message: string };
type Summary = { title: string; questions: number; pattern: string; free: boolean };
type FileResult = {
  name: string;
  text: string;
  state: "checking" | "valid" | "invalid" | "importing" | "imported" | "failed";
  summary?: Summary;
  issues?: Issue[];
  message?: string;
};
type CatalogRow = {
  testId: string;
  title: string;
  exam: string;
  subject: string | null;
  testNumber: number;
  isFree: boolean;
  published: boolean;
  versions: number | null;
  latestVersion: number | null;
};

async function post(body: unknown) {
  const res = await fetch("/api/admin/test-papers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

export default function TestPapersPage() {
  const [files, setFiles] = useState<FileResult[]>([]);
  const [publish, setPublish] = useState(true);
  const [tests, setTests] = useState<CatalogRow[]>([]);
  const [listError, setListError] = useState("");

  const loadTests = useCallback(async () => {
    const res = await fetch("/api/admin/test-papers");
    const data = await res.json().catch(() => ({}));
    if (res.ok) setTests(data.tests);
    else setListError(data.error ?? "Could not load tests.");
  }, []);
  useEffect(() => {
    // Initial load of the catalog list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTests();
  }, [loadTests]);

  const update = (name: string, change: Partial<FileResult>) =>
    setFiles((list) => list.map((f) => (f.name === name ? { ...f, ...change } : f)));

  const choose = async (list: FileList | null) => {
    if (!list) return;
    const chosen = await Promise.all(
      [...list].map(async (file) => ({ name: file.name, text: await file.text(), state: "checking" as const })),
    );
    setFiles(chosen);
    for (const f of chosen) {
      let paper: unknown;
      try {
        paper = JSON.parse(f.text);
      } catch {
        update(f.name, { state: "invalid", issues: [{ path: "", message: "This file is not valid JSON." }] });
        continue;
      }
      const { ok, data } = await post({ paper, dryRun: true });
      update(f.name, ok ? { state: "valid", summary: data.summary } : { state: "invalid", issues: data.issues ?? [{ path: "", message: data.error }] });
    }
  };

  const importValid = async () => {
    for (const f of files.filter((x) => x.state === "valid")) {
      update(f.name, { state: "importing" });
      const { ok, data } = await post({ paper: JSON.parse(f.text), publish });
      update(
        f.name,
        ok
          ? {
              state: "imported",
              message: data.result.unchanged
                ? `Unchanged — still version ${data.result.version}`
                : `Version ${data.result.version} ${data.result.published ? "published" : "saved as draft"}`,
            }
          : { state: "failed", message: data.error ?? "Import failed." },
      );
    }
    await loadTests();
  };

  const toggle = async (test: CatalogRow) => {
    const res = await fetch(`/api/admin/test-papers/${test.testId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !test.published }),
    });
    if (!res.ok) setListError((await res.json().catch(() => ({}))).error ?? "Could not update the test.");
    await loadTests();
  };

  const validCount = files.filter((f) => f.state === "valid").length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-3 mb-2">Upload test papers</h1>
        <p className="text-slate-600">
          One JSON file per paper. Each paper is checked against the official pattern for its exam before it is imported.
          Re-uploading a paper creates a new version; students&apos; past attempts keep the version they took.
        </p>
      </div>

      <details className="bg-white rounded-2xl border border-slate-200 p-5 text-sm text-slate-700">
        <summary className="font-semibold cursor-pointer">Paper format</summary>
        <pre className="mt-4 overflow-x-auto bg-slate-50 p-4 rounded-lg text-xs">{`{
  "schemaVersion": "1.0",
  "bundleType": "test_paper",
  "exam": "cuet-ug" | "iiser-iat" | "niser-nest" | "comedk",
  "subject": "physics",          // CUET only — one paper per subject
  "testNumber": 2,               // CUET 1–25, others 1–35
  "free": false,                 // free tests need sign-in but no purchase
  "language": "en",
  "questions": [ /* same question objects as the question-bank format */ ]
}`}</pre>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>CUET: 50 questions, all with the paper&apos;s subject.</li>
          <li>IAT: 15 each of biology, chemistry, mathematics, physics. NEST: 20 each. COMEDK: 60 each of physics, chemistry, mathematics.</li>
          <li>Marks, negative marks and duration come from the official pattern — they are not set in the file.</li>
          <li>Images: not supported yet (image storage still needs to be set up).</li>
        </ul>
      </details>

      <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
        <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50">
          <input type="file" accept=".json,application/json" multiple className="sr-only" onChange={(e) => choose(e.target.files)} />
          <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <span className="font-medium text-slate-700">Choose one or more paper files</span>
          <span className="block text-sm text-slate-500 mt-1">JSON, up to 5 MB each</span>
        </label>

        {files.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {files.map((f) => (
              <li key={f.name} className="py-3 flex gap-3">
                {f.state === "invalid" || f.state === "failed" ? (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                ) : f.state === "imported" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0 mt-0.5" />
                ) : (
                  <FileJson className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-medium">
                    {f.summary?.title ?? f.name}
                    <span className="ml-2 text-xs text-slate-500">{f.name}</span>
                  </p>
                  {f.summary && (
                    <p className="text-sm text-slate-600">
                      {f.summary.questions} questions · {f.summary.pattern}
                      {f.summary.free ? " · free" : ""}
                    </p>
                  )}
                  {f.state === "checking" && <p className="text-sm text-slate-500">Checking…</p>}
                  {f.state === "importing" && <p className="text-sm text-slate-500">Importing…</p>}
                  {f.message && <p className={`text-sm ${f.state === "failed" ? "text-red-700" : "text-green-800"}`}>{f.message}</p>}
                  {f.issues && (
                    <ul className="mt-1 text-sm text-red-800 list-disc pl-5">
                      {f.issues.map((issue, i) => (
                        <li key={i}>
                          {issue.path && <code className="text-xs">{issue.path}</code>} {issue.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-4 justify-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
            Publish to students immediately
          </label>
          <button className="button-primary px-5 py-2.5 disabled:opacity-50" disabled={!validCount} onClick={importValid}>
            Import {validCount || ""} valid paper{validCount === 1 ? "" : "s"}
          </button>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-semibold mb-4">Tests in the catalog</h2>
        {listError && <p className="text-sm text-red-700 mb-3">{listError}</p>}
        {tests.length === 0 ? (
          <p className="text-sm text-slate-600">No tests uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Exam</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Test</th>
                  <th className="py-2 pr-4">Version</th>
                  <th className="py-2 pr-4">Access</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map((t) => (
                  <tr key={t.testId}>
                    <td className="py-2 pr-4">{isExamSlug(t.exam) ? EXAMS[t.exam].shortName : t.exam}</td>
                    <td className="py-2 pr-4">{t.subject && isSubjectId(t.subject) ? SUBJECT_NAMES[t.subject] : "—"}</td>
                    <td className="py-2 pr-4">{t.testNumber}</td>
                    <td className="py-2 pr-4">v{t.latestVersion ?? 0}</td>
                    <td className="py-2 pr-4">{t.isFree ? "Free" : "Series"}</td>
                    <td className="py-2">
                      <button
                        onClick={() => toggle(t)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${t.published ? "bg-green-100 text-green-900" : "bg-slate-100 text-slate-700"}`}
                        aria-label={`${t.published ? "Unpublish" : "Publish"} ${t.title}`}
                      >
                        {t.published ? "Published — hide" : "Hidden — publish"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
