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
} from "lucide-react";
import { questionsFor } from "@/data/student/bank";
import {
  EMPTY_RESPONSE,
  SUBJECTS,
  TYPE_LABELS,
  answered,
  type Subject,
} from "@/lib/student/model";
import {
  finishAttempt,
  setResponse,
  startAttempt,
  updateAttempt,
  useDemo,
  storageWarning,
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
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = Math.min(attempt?.current ?? 0, qs.length - 1);
  const q = qs[current];
  const response = attempt?.responses[q.id];
  useEffect(() => {
    if (!attempt || !state.signedIn) return;
    const id = attempt.id;
    const deadline = attempt.deadline;
    // Read the wall clock after commit, inside effect setup, never during render.
    // eslint-disable-next-line react-hooks/purity
    let last = Date.now();
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= deadline) {
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
  }, [attempt?.id, attempt?.deadline, q.id, state.signedIn, router]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (
      startedId &&
      state.attempts.find((a) => a.id === startedId)?.submittedAt
    )
      router.replace(`/student/results/${startedId}`);
  }, [state.attempts, startedId, router]);
  const go = (index: number) => {
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
          <p className="eyebrow">{info.title} · Practice demo 01</p>
          <h1>
            A fresh start.
            <br />
            <em>Fifty chances to learn.</em>
          </h1>
          <p>
            Take this test at your pace within a 90-minute window. Your analysis
            will turn each response into a useful next step.
          </p>
          <div className="student-card-facts">
            <span>50 questions</span>
            <span>90 minutes</span>
            <span>200 marks</span>
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
              Ten practice formats, five questions of each type. This is a
              subject demo, not an official exam pattern.
            </li>
            <li>
              You can move freely, clear answers and mark questions for review.
              Confidence is optional and never changes marks.
            </li>
            <li>
              The timer continues when you leave or refresh. Answers save in
              this browser. Time per question estimates visible-tab attention.
            </li>
            <li>
              Use the on-screen Submit button at any point; the demo also
              submits when time runs out while open, or on return.
            </li>
          </ul>
          <button
            className="button-primary"
            onClick={() => setStartedId(startAttempt(subject))}
          >
            Start {info.title.toLowerCase()} test <ArrowRight size={18} />
          </button>
        </section>
      ) : (
        <>
          <div className="test-title-row">
            <div>
              <p className="eyebrow">{info.title} · Practice demo 01</p>
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
                onChange={(value) =>
                  setResponse(attempt.id, q.id, {
                    value,
                    changes: (response?.changes ?? 0) + 1,
                  })
                }
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
                      onChange={() =>
                        setResponse(attempt.id, q.id, { confidence: c })
                      }
                    />
                    {["Still guessing", "Somewhat sure", "Confident"][i]}
                  </label>
                ))}
              </fieldset>
              <div className="question-tools">
                <button
                  className="student-text-button"
                  onClick={() =>
                    setResponse(attempt.id, q.id, {
                      value: "",
                      confidence: undefined,
                    })
                  }
                >
                  Clear response
                </button>
                <button
                  className="student-text-button"
                  aria-pressed={response?.marked ?? false}
                  onClick={() =>
                    setResponse(attempt.id, q.id, { marked: !response?.marked })
                  }
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
                <p className="student-save-note">
                  <CheckCircle2 size={14} />{" "}
                  {storageWarning()
                    ? "Using memory only; see storage warning"
                    : "Responses saved in this browser"}
                </p>
                <div
                  className="question-palette"
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
          <dialog ref={dialog} className="student-submit-dialog">
            <h2>Ready to see what you can learn?</h2>
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
            <div>
              <button
                className="student-secondary"
                onClick={() => dialog.current?.close()}
              >
                Keep practising
              </button>
              <button
                className="button-primary"
                onClick={() => {
                  finishAttempt(attempt.id);
                  dialog.current?.close();
                  router.push(`/student/results/${attempt.id}`);
                }}
              >
                Submit & see analysis
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
