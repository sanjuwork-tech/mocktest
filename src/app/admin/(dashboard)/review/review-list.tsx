"use client";

import Link from "next/link";
import { useState } from "react";
import { EXAMS, SUBJECT_NAMES, isExamSlug, isSubjectId } from "@/lib/exams/catalog";
import type { PaperStatus } from "./status";

type Paper = {
  testId: string;
  title: string;
  exam: string | null;
  subject: string | null;
  testNumber: number | null;
  published: boolean;
  version: number;
  total: number;
  verified: number;
  issues: number;
  mine: number;
  status: PaperStatus;
};
type Issue = {
  revisionId: string;
  externalId: string;
  reviewerName: string;
  comment: string | null;
  updatedAt: string;
  testId: string;
  title: string;
  version: number;
};
type Show = "all" | "mine" | "issues";

export const examName = (exam: string | null) => (exam && isExamSlug(exam) ? EXAMS[exam].shortName : (exam ?? "—"));
export const subjectName = (subject: string | null) =>
  subject ? (isSubjectId(subject) ? SUBJECT_NAMES[subject] : subject) : "All sections";

export function ReviewList({
  papers,
  issues,
  role,
  name,
  failed,
}: {
  papers: Paper[];
  issues: Issue[];
  role: "admin" | "reviewer" | "editor";
  name: string;
  failed: boolean;
}) {
  const [exam, setExam] = useState("all");
  const [subject, setSubject] = useState("all");
  const [show, setShow] = useState<Show>("all");
  const canReview = role !== "editor";

  const exams = [...new Set(papers.map((p) => p.exam ?? ""))];
  const subjects = [
    ...new Set(papers.filter((p) => exam === "all" || p.exam === exam).flatMap((p) => (p.subject ? [p.subject] : []))),
  ];
  const shown = papers.filter(
    (p) =>
      (exam === "all" || p.exam === exam) &&
      (subject === "all" || p.subject === subject) &&
      (show === "all" || (show === "mine" ? p.mine < p.total : p.issues > 0)),
  );
  const myDone = papers.reduce((n, p) => n + p.mine, 0);
  const allQuestions = papers.reduce((n, p) => n + p.total, 0);
  const myPapers = papers.filter((p) => p.total > 0 && p.mine >= p.total).length;

  return (
    <main id="main-content" tabIndex={-1} className="page-shell rv-page">
      <p className="eyebrow">Expert review</p>
      <h1 className="rv-title">Review test papers</h1>
      <p className="rv-lead">
        {role === "reviewer"
          ? `Welcome, ${name}. Open a paper, read each question with its answer and explanation, and mark it Verified or Has an issue. Your verdicts save as you go.`
          : "Papers go live as soon as they are uploaded and validated. Expert review runs alongside: issues raised here are fixed in the paper JSON and re-uploaded. Changed questions then need review again."}
      </p>

      {failed && (
        <p role="alert" className="rv-alert">
          Papers could not be loaded. Check the database connection and refresh.
        </p>
      )}

      {canReview && (
        <section className="rv-mine" aria-labelledby="rv-mine-title">
          <h2 id="rv-mine-title">My progress</h2>
          <dl>
            <div>
              <dt>Questions you reviewed</dt>
              <dd>
                {myDone} <small>of {allQuestions}</small>
              </dd>
            </div>
            <div>
              <dt>Papers you finished</dt>
              <dd>
                {myPapers} <small>of {papers.length}</small>
              </dd>
            </div>
          </dl>
        </section>
      )}

      <div className="rv-filters">
        <label>
          Exam
          <select
            value={exam}
            onChange={(e) => {
              setExam(e.target.value);
              setSubject("all");
            }}
          >
            <option value="all">All exams</option>
            {exams.map((e) => (
              <option key={e} value={e}>
                {examName(e)}
              </option>
            ))}
          </select>
        </label>
        {subjects.length > 0 && (
          <label>
            Subject
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {subjectName(s)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Show
          <select value={show} onChange={(e) => setShow(e.target.value as Show)}>
            <option value="all">All papers</option>
            {canReview && <option value="mine">Not finished by me</option>}
            <option value="issues">With open issues</option>
          </select>
        </label>
        <p role="status">
          {shown.length} of {papers.length} papers
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="rv-empty">{papers.length ? "No papers match these filters." : "No papers to review yet."}</p>
      ) : (
        <ul className="rv-papers">
          {shown.map((p) => (
            <li key={p.testId}>
              <div className="rv-paper-name">
                <strong>
                  {examName(p.exam)} {p.subject ? `· ${subjectName(p.subject)} ` : ""}· Test {p.testNumber}
                </strong>
                <span>
                  Version {p.version}
                  {!p.published && " · hidden from students"}
                </span>
              </div>
              <div className="rv-paper-progress">
                <span className={`rv-badge rv-badge-${p.status.kind}`}>{p.status.label}</span>
                <Meter total={p.total} verified={p.verified} issues={p.issues} />
                <span className="rv-paper-counts">
                  {p.verified}/{p.total} verified · {p.issues} open issue{p.issues === 1 ? "" : "s"}
                  {canReview && ` · you: ${p.mine}/${p.total}`}
                </span>
              </div>
              <Link className="button-secondary rv-open" href={`/admin/review/${p.testId}`}>
                {canReview ? (p.mine >= p.total && p.total ? "Open" : p.mine ? "Continue" : "Start") : "View"}
                <span className="sr-only"> {p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {role !== "reviewer" && (
        <section className="rv-issues" aria-labelledby="rv-issues-title">
          <h2 id="rv-issues-title">Open issues ({issues.length})</h2>
          <p className="rv-lead">
            Fix the question in the paper JSON (find it by its question ID) and re-upload the paper on{" "}
            <Link className="text-link" href="/admin/test-papers">
              Upload test papers
            </Link>
            . The fixed question becomes a new revision and goes back to Not reviewed.
          </p>
          {issues.length === 0 ? (
            <p className="rv-empty">No open issues.</p>
          ) : (
            <ul>
              {issues.map((i) => (
                <li key={`${i.revisionId}-${i.testId}-${i.reviewerName}`}>
                  <p>
                    <Link className="text-link" href={`/admin/review/${i.testId}?rev=${i.revisionId}`}>
                      {i.title} (v{i.version})
                    </Link>{" "}
                    · question ID <code>{i.externalId}</code>
                  </p>
                  <blockquote>{i.comment}</blockquote>
                  <p className="rv-who">
                    {i.reviewerName} ·{" "}
                    {new Date(i.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

/** Verified share then issue share of a paper's questions; the text beside it carries the same numbers. */
export function Meter({ total, verified, issues }: { total: number; verified: number; issues: number }) {
  const ok = total ? (verified / total) * 100 : 0;
  const bad = total ? (issues / total) * 100 : 0;
  return (
    <svg className="rv-meter" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
      <rect className="rv-meter-track" width="100" height="8" />
      <rect className="rv-meter-ok" width={ok} height="8" />
      <rect className="rv-meter-issue" x={ok} width={bad} height="8" />
    </svg>
  );
}
