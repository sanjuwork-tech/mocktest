"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Flag,
  Send,
  CheckCircle2,
  CloudCheck,
  CloudAlert,
  Loader2,
} from "lucide-react";
import { questionsFor } from "@/data/student/bank";
import {
  EMPTY_RESPONSE,
  SUBJECTS,
  TYPE_LABELS,
  answered,
  type Response as StudentResponse,
  type Subject,
} from "@/lib/student/model";
import {
  finishAttempt,
  setResponse,
  startAttempt,
  updateAttempt,
  useDemo,
  storageWarning,
  mutate,
} from "@/lib/student/store";
import { StudentShell } from "./shell";
import { AnswerInput, QuestionContent } from "./question";

export function TestPlayer({ subject }: { subject: Subject }) {
  const state = useDemo();
  const router = useRouter();
  const qs = questionsFor(subject);
  const info = SUBJECTS.find((s) => s.id === subject)!;
  const attempt = state.attempts.find(
    (a) => a.subject === subject && !a.submittedAt,
  );
  const [now, setNow] = useState(0);
  const [startedId, setStartedId] = useState("");
  const [syncStatus, setSyncStatus] = useState<"saved" | "saving" | "offline">("saved");
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = Math.min(attempt?.current ?? 0, qs.length - 1);
  const q = qs[current];
  const response = attempt?.responses[q.id];

  useEffect(() => {
    if (!attempt || !state.signedIn) return;
    const id = attempt.id;
    const deadline = attempt.deadline;
    // eslint-disable-next-line react-hooks/purity
    let last = Date.now();

    const tick = async () => {
      const time = Date.now();
      setNow(time);
      if (time >= deadline) {
        // Auto-submit on server deadline
        try {
          await fetch(`/api/student/attempts/${id}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responses: attempt.responses }),
          });
        } catch {
          // Ignore
        }
        finishAttempt(id, true);
        router.replace(`/student/results/${id}`);
        return;
      }
      const elapsed = Math.min((time - last) / 1000, 2);
      last = time;
      if (document.visibilityState === "visible")
        updateAttempt(id, (a) =>
          a.submittedAt
            ? a
            : {
                ...a,
                responses: {
                  ...a.responses,
                  [q.id]: {
                    ...EMPTY_RESPONSE,
                    ...a.responses[q.id],
                    seconds: (a.responses[q.id]?.seconds ?? 0) + elapsed,
                  },
                },
              },
        );
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [attempt, state.signedIn, qs, router, q?.id]);

  useEffect(() => {
    if (
      startedId &&
      state.attempts.find((a) => a.id === startedId)?.submittedAt
    )
      router.replace(`/student/results/${startedId}`);
  }, [state.attempts, startedId, router]);

  const handleStartTest = async () => {
    setIsStarting(true);
    try {
      // Start attempt on server
      const res = await fetch("/api/student/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      if (res.ok) {
        const data = await res.json();
        // Sync server attempt with local store
        mutate((s) => ({
          ...s,
          attempts: [
            ...s.attempts.filter((a) => a.subject !== subject || Boolean(a.submittedAt)),
            {
              id: data.attemptId,
              subject,
              startedAt: data.startedAt,
              deadline: data.deadline,
              current: 0,
              responses: {},
              reflections: {},
            },
          ],
        }));
        setStartedId(data.attemptId);
        setIsStarting(false);
        return;
      }
    } catch {
      // Offline fallback
    }

    const localId = startAttempt(subject);
    setStartedId(localId);
    setIsStarting(false);
  };

  const attemptRef = useRef(attempt);
  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);
  const pendingSyncRef = useRef<Map<string, StudentResponse>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const flushPendingSync = async () => {
    const curAttempt = attemptRef.current;
    if (!curAttempt || pendingSyncRef.current.size === 0) return;
    const entries = Array.from(pendingSyncRef.current.entries());
    setSyncStatus("saving");
    try {
      for (const [qId, resp] of entries) {
        const res = await fetch(`/api/student/attempts/${curAttempt.id}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: qId, response: resp }),
        });
        if (res.ok) {
          pendingSyncRef.current.delete(qId);
        } else {
          setSyncStatus("offline");
          return;
        }
      }
      setSyncStatus("saved");
    } catch {
      setSyncStatus("offline");
    }
  };

  const queueResponseSync = (
    questionId: string,
    updatedResponse: StudentResponse,
    immediate = false,
  ) => {
    const curAttempt = attemptRef.current;
    if (!curAttempt) return;
    pendingSyncRef.current.set(questionId, updatedResponse);
    setSyncStatus("saving");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (immediate) {
      void flushPendingSync();
    } else {
      debounceTimerRef.current = setTimeout(() => {
        void flushPendingSync();
      }, 400);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      if (pendingSyncRef.current.size > 0) {
        void flushPendingSync();
      }
    };
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleResponseChange = (value: string | string[]) => {
    if (!attempt) return;
    const newChanges = (response?.changes ?? 0) + 1;
    const updated = {
      value,
      changes: newChanges,
    };
    setResponse(attempt.id, q.id, updated);
    queueResponseSync(q.id, {
      ...EMPTY_RESPONSE,
      ...response,
      ...updated,
    });
  };

  const handleConfidenceChange = (c: "low" | "medium" | "high") => {
    if (!attempt) return;
    const updated = { confidence: c };
    setResponse(attempt.id, q.id, updated);
    queueResponseSync(
      q.id,
      {
        ...EMPTY_RESPONSE,
        ...response,
        ...updated,
      },
      true,
    );
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setIsSubmitting(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    try {
      await fetch(`/api/student/attempts/${attempt.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: attempt.responses }),
      });
    } catch {
      // Offline submission
    }
    finishAttempt(attempt.id);
    dialog.current?.close();
    router.push(`/student/results/${attempt.id}`);
  };

  const go = (index: number) => {
    if (pendingSyncRef.current.size > 0) void flushPendingSync();
    if (attempt) updateAttempt(attempt.id, (a) => ({ ...a, current: index }));
    heading.current?.focus();
  };

  const totalAnswered = qs.filter((q) =>
    answered(q, attempt?.responses[q.id]),
  ).length;

  const remaining = Math.max(
    0,
    Math.ceil(
      ((attempt?.deadline ?? 0) - (now || attempt?.startedAt || 0)) / 1000,
    ),
  );

  return (
    <StudentShell>
      {!attempt ? (
        <section className="student-panel test-intro">
          <p className="eyebrow">{info.title} · Diagnostic Practice Mock</p>
          <h1>
            A fresh start.
            <br />
            <em>Fifty chances to learn.</em>
          </h1>
          <p>
            Take this test at your pace within a 90-minute window. Your answers will
            autosave with cloud synchronization, and your diagnostic report will turn each
            response into a useful next step.
          </p>
          <div className="student-card-facts">
            <span>50 questions</span>
            <span>90 minutes</span>
            <span>200 marks</span>
            <span style={{ color: "var(--blue)", fontWeight: 600 }}>Free Diagnostic Mock</span>
          </div>
          <h2>Before you begin</h2>
          <ul>
            <li>
              +4 for a correct answer, −1 for an incorrect answer, 0 unanswered.
            </li>
            <li>
              Multiple correct, matching and ordering require the complete
              correct answer. No partial marks.
            </li>
            <li>
              Ten practice formats, five questions of each type. All equations and diagrams render in standard scientific notation.
            </li>
            <li>
              You can move freely, clear answers and mark questions for review.
              Confidence is optional and never changes marks.
            </li>
            <li>
              Responses autosave in real time. If your network blips, responses are preserved locally and resynced automatically.
            </li>
            <li>
              The test automatically submits when time runs out, or when you click Review & Submit.
            </li>
          </ul>
          <button
            className="button-primary"
            onClick={handleStartTest}
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Preparing test…
              </>
            ) : (
              <>
                Start {info.title.toLowerCase()} test <ArrowRight size={18} />
              </>
            )}
          </button>
        </section>
      ) : (
        <>
          <div className="test-title-row">
            <div>
              <p className="eyebrow">{info.title} · Diagnostic Mock</p>
              <h1>Stay curious. Keep going.</h1>
            </div>
            <div
              className={`test-clock ${remaining < 300 ? "clock-low" : ""}`}
              aria-label="Time remaining"
            >
              <Clock3 size={22} />
              <strong>
                {Math.floor(remaining / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(remaining % 60).toString().padStart(2, "0")}
              </strong>
              <span>remaining</span>
            </div>
          </div>
          <div className="test-layout">
            <section className="student-panel question-panel">
              <div className="question-meta">
                <span>{TYPE_LABELS[q.type]}</span>
                <span>{q.difficulty} · +4 / −1</span>
              </div>
              <h2 ref={heading} tabIndex={-1}>
                Question {current + 1}
                <span> / 50</span>
              </h2>
              <p className="student-muted">{q.topic}</p>
              <QuestionContent question={q} />
              <AnswerInput
                question={q}
                response={response}
                onChange={handleResponseChange}
              />
              <fieldset className="confidence-options">
                <legend>
                  How sure do you feel?{" "}
                  <span>Optional · no effect on your score</span>
                </legend>
                {(["low", "medium", "high"] as const).map((c, i) => (
                  <label
                    key={c}
                    className={response?.confidence === c ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name={`confidence-${q.id}`}
                      checked={response?.confidence === c}
                      onChange={() => handleConfidenceChange(c)}
                    />
                    {["Still guessing", "Somewhat sure", "Confident"][i]}
                  </label>
                ))}
              </fieldset>
              <div className="question-tools">
                <button
                  className="student-text-button"
                  onClick={() => {
                    setResponse(attempt.id, q.id, {
                      value: "",
                      confidence: undefined,
                    });
                    queueResponseSync(
                      q.id,
                      {
                        ...EMPTY_RESPONSE,
                        ...response,
                        value: "",
                        confidence: undefined,
                      },
                      true,
                    );
                  }}
                >
                  Clear response
                </button>
                <button
                  className="student-text-button"
                  aria-pressed={response?.marked ?? false}
                  onClick={() => {
                    const marked = !response?.marked;
                    setResponse(attempt.id, q.id, { marked });
                    queueResponseSync(
                      q.id,
                      {
                        ...EMPTY_RESPONSE,
                        ...response,
                        marked,
                      },
                      true,
                    );
                  }}
                >
                  <Flag size={16} />
                  {response?.marked ? "Marked for review" : "Mark for review"}
                </button>
              </div>
              <div className="question-navigation">
                <button
                  className="student-secondary"
                  disabled={current === 0}
                  onClick={() => go(current - 1)}
                >
                  <ArrowLeft size={17} /> Previous
                </button>
                {current < 49 ? (
                  <button
                    className="button-primary"
                    onClick={() => go(current + 1)}
                  >
                    Save & next <ArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    className="button-primary"
                    onClick={() => dialog.current?.showModal()}
                  >
                    Review & submit <Send size={17} />
                  </button>
                )}
              </div>
            </section>
            <aside className="test-sidebar">
              <div className="student-panel">
                <div className="section-heading">
                  <h2>Your progress</h2>
                  <strong>{totalAnswered}/50</strong>
                </div>
                <progress
                  max={50}
                  value={totalAnswered}
                  aria-label="Questions answered"
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    marginTop: "8px",
                    color: syncStatus === "offline" ? "#b45309" : "#3b82f6",
                  }}
                >
                  {syncStatus === "saved" && (
                    <>
                      <CloudCheck size={14} /> Cloud autosave synced
                    </>
                  )}
                  {syncStatus === "saving" && (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Autosaving…
                    </>
                  )}
                  {syncStatus === "offline" && (
                    <>
                      <CloudAlert size={14} /> Saved locally (offline backup)
                    </>
                  )}
                </div>
                <p className="student-save-note">
                  <CheckCircle2 size={14} />{" "}
                  {storageWarning()
                    ? "Using memory fallback"
                    : "Progress safely retained"}
                </p>
                <div
                  className="question-palette"
                  role="navigation"
                  aria-label="Question navigation"
                >
                  {qs.map((item, i) => {
                    const r = attempt.responses[item.id];
                    const done = answered(item, r);
                    return (
                      <button
                        key={item.id}
                        className={`${done ? "is-answered" : ""} ${r?.marked ? "is-marked" : ""} ${i === current ? "is-current" : ""}`}
                        aria-current={i === current ? "step" : undefined}
                        aria-label={`Question ${i + 1}, ${done ? "answered" : "unanswered"}${r?.marked ? ", marked for review" : ""}`}
                        onClick={() => go(i)}
                      >
                        {i + 1}
                        {r?.marked && <span aria-hidden="true">•</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="palette-key">
                  <span>
                    <i className="key-answered" />
                    Answered
                  </span>
                  <span>
                    <i />
                    Unanswered
                  </span>
                  <span>
                    <i className="key-marked" />
                    Marked
                  </span>
                </div>
                <button
                  className="button-primary"
                  onClick={() => dialog.current?.showModal()}
                >
                  Submit test <Send size={16} />
                </button>
              </div>
              <p className="student-muted">
                A difficult question is information, not a verdict. Mark it and
                return when you’re ready.
              </p>
            </aside>
          </div>
          <dialog
            ref={dialog}
            className="student-submit-dialog"
            aria-labelledby="submit-dialog-title"
            aria-describedby="submit-dialog-desc"
          >
            <h2 id="submit-dialog-title">Ready to see what you can learn?</h2>
            <div id="submit-dialog-desc">
              <p>
                You answered {totalAnswered} of 50 questions. {50 - totalAnswered}{" "}
                remain unanswered and receive zero marks.
              </p>
              <p>
                {qs.filter((q) => attempt.responses[q.id]?.marked).length}{" "}
                questions are marked for review. Marked answers are scored
                normally.
              </p>
              <p>
                Submitting ends this attempt. You can review every explanation and
                start another test afterwards.
              </p>
            </div>
            <div>
              <button
                className="student-secondary"
                onClick={() => dialog.current?.close()}
                disabled={isSubmitting}
              >
                Keep practising
              </button>
              <button
                className="button-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Submitting…
                  </>
                ) : (
                  <>
                    Submit & see analysis <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </dialog>
        </>
      )}
      <Link href="/student" className="student-back-link">
        Back to my practice space
      </Link>
    </StudentShell>
  );
}
