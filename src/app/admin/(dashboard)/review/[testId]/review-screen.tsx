"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";
import { ScientificRenderer, type Block } from "@/components/ui/scientific-renderer";
import type { ReviewEntry, ReviewPaper } from "@/server/reviews";
import { countPaper, paperStatus, questionState, type Verdict } from "../status";
import { examName, subjectName, Meter } from "../review-list";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const STATE_TEXT = { unreviewed: "not reviewed", verified: "verified", issue: "has an issue" } as const;

export function ReviewScreen({
  paper,
  meId,
  canReview,
  start,
}: {
  paper: ReviewPaper;
  meId: string;
  canReview: boolean;
  start: number;
}) {
  const [questions, setQuestions] = useState(paper.questions);
  const [index, setIndex] = useState(start);
  const current = questions[index];
  const mine = current?.reviews.find((r) => r.reviewerId === meId);
  const [comment, setComment] = useState(mine?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const counts = countPaper(questions.map((q) => q.reviews.map((r) => r.verdict)));
  const status = paperStatus(counts);
  const myCount = questions.filter((q) => q.reviews.some((r) => r.reviewerId === meId)).length;

  const go = useCallback(
    (next: number, focus = true) => {
      if (next < 0 || next >= questions.length) return;
      setIndex(next);
      setComment(questions[next].reviews.find((r) => r.reviewerId === meId)?.comment ?? "");
      setError("");
      const url = new URL(window.location.href);
      url.searchParams.delete("rev");
      url.searchParams.set("q", String(next + 1));
      window.history.replaceState(null, "", url);
      if (focus) requestAnimationFrame(() => headingRef.current?.focus());
    },
    [questions, meId],
  );

  const save = useCallback(
    async (verdict: Verdict) => {
      if (!canReview || saving || !current) return;
      const text = comment.trim();
      if (verdict === "issue" && !text) {
        setError("Describe the issue in the comment box first.");
        commentRef.current?.focus();
        return;
      }
      setSaving(true);
      setError("");
      setNotice("");
      try {
        const res = await fetch("/api/admin/reviews/verdicts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revisionId: current.revisionId, verdict, comment: text || null }),
          signal: AbortSignal.timeout(15000),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Could not save your verdict.");
        const reviews = data.reviews as ReviewEntry[];
        setQuestions((list) => list.map((q) => (q.revisionId === current.revisionId ? { ...q, reviews } : q)));
        setNotice(`Question ${current.number} saved as ${verdict === "ok" ? "Verified" : "Has an issue"}.`);
        go(index + 1);
      } catch (e) {
        setError(
          e instanceof Error && e.name === "Error" ? e.message : "Connection interrupted. Your verdict may not be saved — try again.",
        );
      } finally {
        setSaving(false);
      }
    },
    [canReview, saving, current, comment, index, go],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = target.closest("textarea, input, select, [contenteditable]");
      if (typing) {
        if (target === commentRef.current && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void save("issue");
        }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "v" && canReview) {
        e.preventDefault();
        void save("ok");
      } else if (key === "i" && canReview) {
        e.preventDefault();
        if (comment.trim()) void save("issue");
        else commentRef.current?.focus();
      } else if (key === "arrowright" || key === "n") {
        e.preventDefault();
        go(index + 1);
      } else if (key === "arrowleft" || key === "p") {
        e.preventDefault();
        go(index - 1);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [save, go, index, comment, canReview]);

  const t = paper.test;
  const heading = `${examName(t.exam)}${t.subject ? ` · ${subjectName(t.subject)}` : ""} · Test ${t.testNumber}`;

  if (!current)
    return (
      <main id="main-content" tabIndex={-1} className="page-shell rv-page">
        <Link href="/admin/review" className="text-link">
          ← All papers
        </Link>
        <h1 className="rv-title">{heading}</h1>
        <p className="rv-empty">This paper has no questions.</p>
      </main>
    );

  const others = current.reviews.filter((r) => r.reviewerId !== meId);
  const state = questionState(current.reviews.map((r) => r.verdict));

  return (
    <main id="main-content" tabIndex={-1} className="page-shell rv-page">
      <Link href="/admin/review" className="text-link">
        ← All papers
      </Link>
      <header className="rv-head">
        <div>
          <p className="eyebrow">
            Version {t.version}
            {!t.published && " · hidden from students"}
          </p>
          <h1 className="rv-title">{heading}</h1>
        </div>
        <div className="rv-head-progress">
          <span className={`rv-badge rv-badge-${status.kind}`}>{status.label}</span>
          <Meter total={counts.total} verified={counts.verified} issues={counts.issues} />
          <span>
            {counts.verified}/{counts.total} verified · {counts.issues} open issue{counts.issues === 1 ? "" : "s"}
            {canReview && ` · you: ${myCount}/${counts.total}`}
          </span>
        </div>
      </header>

      <div className="rv-layout">
        <article className="rv-question" aria-labelledby="rv-q-title">
          <div className="rv-q-top">
            <h2 id="rv-q-title" ref={headingRef} tabIndex={-1}>
              Question {current.number} <small>of {questions.length}</small>
            </h2>
            <span className={`rv-badge rv-badge-${state === "unreviewed" ? "none" : state === "verified" ? "verified" : "issues"}`}>
              {state === "unreviewed" ? "Not reviewed" : state === "verified" ? "Verified" : "Has an issue"}
            </span>
          </div>
          <p className="rv-meta">
            {paper.multiSection && <span>{current.sectionName}</span>}
            {current.topics?.length ? <span>Topic: {current.topics.join(", ")}</span> : null}
            {current.difficulty && <span>Difficulty: {current.difficulty}</span>}
            <span>
              +{current.marks} / −{current.penalty}
            </span>
            <span>
              ID <code>{current.externalId}</code>
            </span>
          </p>

          <ScientificRenderer content={current.content as Block[]} />
          <ul className="rv-options">
            {current.options.map((o, j) => (
              <li key={o.key} className={o.key === current.correctOptionId ? "is-correct" : undefined}>
                <span className="rv-letter">{LETTERS[j] ?? o.key}</span>
                <ScientificRenderer content={o.content as Block[]} />
                {o.key === current.correctOptionId && <small>Correct answer</small>}
              </li>
            ))}
          </ul>
          <div className="rv-explanation">
            <strong>Explanation</strong>
            <ScientificRenderer content={(current.explanation ?? []) as Block[]} />
          </div>

          {canReview ? (
            <form
              className="rv-verdict"
              onSubmit={(e) => {
                e.preventDefault();
                void save("issue");
              }}
              aria-busy={saving}
            >
              <label htmlFor="rv-comment">
                Comment <span>(required for an issue, optional when verified)</span>
              </label>
              <textarea
                id="rv-comment"
                ref={commentRef}
                rows={3}
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-describedby="rv-keys"
                aria-invalid={Boolean(error) && !comment.trim()}
              />
              {mine && (
                <p className="rv-mine-note">
                  Your verdict: <strong>{mine.verdict === "ok" ? "Verified" : "Has an issue"}</strong>. Choose again to change it.
                </p>
              )}
              {error && (
                <p role="alert" className="rv-alert">
                  {error}
                </p>
              )}
              <div className="rv-actions">
                <button type="button" className="button-primary rv-ok" disabled={saving} onClick={() => void save("ok")}>
                  <Check size={18} aria-hidden="true" /> Verified
                </button>
                <button type="submit" className="button-secondary rv-issue" disabled={saving}>
                  <Flag size={18} aria-hidden="true" /> Has an issue
                </button>
              </div>
              <p id="rv-keys" className="rv-keys">
                Keys: <kbd>V</kbd> verified · <kbd>I</kbd> has an issue · <kbd>Ctrl</kbd>+<kbd>Enter</kbd> in the comment saves
                an issue · <kbd>←</kbd> <kbd>→</kbd> previous / next. Saving moves to the next question.
              </p>
            </form>
          ) : (
            <p className="rv-mine-note">Editors can read verdicts; reviewers and admins record them.</p>
          )}
          <p role="status" className="rv-notice">
            {notice}
          </p>

          <nav className="rv-step" aria-label="Question navigation">
            <button type="button" className="button-secondary" onClick={() => go(index - 1)} disabled={index === 0}>
              <ArrowLeft size={16} aria-hidden="true" /> Previous
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => go(index + 1)}
              disabled={index === questions.length - 1}
            >
              Next <ArrowRight size={16} aria-hidden="true" />
            </button>
          </nav>

          <section className="rv-reviews" aria-labelledby="rv-reviews-title">
            <h3 id="rv-reviews-title">Other reviewers ({others.length})</h3>
            {others.length === 0 ? (
              <p className="rv-empty">No other verdicts on this question yet.</p>
            ) : (
              <ul>
                {others.map((r) => (
                  <li key={r.reviewerId} className={r.verdict === "issue" ? "is-issue" : "is-ok"}>
                    <p>
                      <strong>{r.reviewerName}</strong> · {r.verdict === "ok" ? "Verified" : "Has an issue"} ·{" "}
                      {new Date(r.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}{" "}
                      IST
                    </p>
                    {r.comment && <blockquote>{r.comment}</blockquote>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>

        <aside className="rv-palette" aria-labelledby="rv-palette-title">
          <h2 id="rv-palette-title">Questions</h2>
          <ol>
            {questions.map((q, i) => {
              const s = questionState(q.reviews.map((r) => r.verdict));
              const byMe = q.reviews.some((r) => r.reviewerId === meId);
              return (
                <li key={q.assignmentId}>
                  <button
                    type="button"
                    className={`rv-cell rv-cell-${s}${byMe ? " rv-cell-mine" : ""}`}
                    aria-current={i === index ? "true" : undefined}
                    aria-label={`Question ${q.number}: ${STATE_TEXT[s]}${byMe ? ", you reviewed it" : ""}`}
                    onClick={() => go(i)}
                  >
                    {q.number}
                  </button>
                </li>
              );
            })}
          </ol>
          <ul className="rv-legend">
            <li>
              <i className="rv-cell-verified" /> Verified
            </li>
            <li>
              <i className="rv-cell-issue" /> Has an issue
            </li>
            <li>
              <i className="rv-cell-unreviewed" /> Not reviewed
            </li>
            <li>
              <i className="rv-cell-unreviewed rv-cell-mine" /> Dot: you reviewed
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
