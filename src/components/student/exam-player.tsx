"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Flag, LayoutGrid, Loader2, Send, X } from "lucide-react";
import { ScientificRenderer, type Block } from "@/components/ui/scientific-renderer";
import { api, ApiFailure } from "./api";
import { StudentShell } from "./shell";

type Question = {
  assignmentId: string;
  sectionId: string;
  marks: number;
  penalty: number;
  content: Block[];
  options: { key: string; content: Block[] }[];
};

type AttemptData = {
  attempt: { id: string; status: string; serverNow: string; deadline: string };
  test: { title: string };
  sections: { id: string; name: string }[];
  questions: Question[];
  answers: { assignmentId: string; value: string | null; sequence: number; marked: boolean }[];
};

type Answer = { value: string | null; marked: boolean; sequence: number };
type Status = "not-visited" | "not-answered" | "answered" | "marked" | "answered-marked";
type SaveState = "saved" | "saving" | "retrying";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const STATUS_LABEL: Record<Status, string> = {
  "not-visited": "Not visited",
  "not-answered": "Not answered",
  answered: "Answered",
  marked: "Marked for review",
  "answered-marked": "Answered & marked for review",
};

export function ExamPlayer({ attemptId }: { attemptId: string }) {
  return (
    <StudentShell examMode>
      <Player attemptId={attemptId} />
    </StudentShell>
  );
}

function Player({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [data, setData] = useState<AttemptData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [current, setCurrent] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [answers, setAnswers] = useState(() => new Map<string, Answer>());
  const [visited, setVisited] = useState(() => new Set<string>());
  const [clockOffset, setClockOffset] = useState(0);

  // The save queue works from this mirror so in-flight requests always see the latest sequences.
  const answersRef = useRef(answers);
  const writeAnswers = useCallback((update: (draft: Map<string, Answer>) => void) => {
    const next = new Map(answersRef.current);
    update(next);
    answersRef.current = next;
    setAnswers(next);
  }, []);
  const pending = useRef(new Map<string, { value: string | null; marked: boolean }>());
  const inflight = useRef<Promise<void> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushRef = useRef<() => Promise<void>>(async () => undefined);
  const finished = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const visitedKey = `ourmocks:visited:${attemptId}`;

  const goToResults = useCallback(() => {
    finished.current = true;
    router.replace(`/student/results/${attemptId}`);
  }, [attemptId, router]);

  useEffect(() => {
    api<AttemptData>(`/api/attempts/${attemptId}`).then(
      (d) => {
        if (d.attempt.status !== "in_progress") return goToResults();
        setClockOffset(Date.parse(d.attempt.serverNow) - Date.now());
        writeAnswers((draft) => {
          for (const a of d.answers) draft.set(a.assignmentId, a);
        });
        const seen = new Set<string>([d.questions[0]?.assignmentId, ...d.answers.map((a) => a.assignmentId)]);
        try {
          for (const id of JSON.parse(sessionStorage.getItem(visitedKey) ?? "[]")) seen.add(id);
        } catch {
          // Visited state is a convenience; answered questions still show as answered.
        }
        setVisited(seen);
        setData(d);
      },
      (e: Error) => setLoadError(e.message),
    );
  }, [attemptId, goToResults, visitedKey, writeAnswers]);

  const flush = useCallback(async (): Promise<void> => {
    if (inflight.current) {
      await inflight.current;
      if (pending.current.size) return flushRef.current();
      return;
    }
    if (!pending.current.size) return;
    const batch = new Map(pending.current);
    pending.current.clear();
    setSaveState("saving");

    inflight.current = (async () => {
      try {
        const res = await api<{ results: { assignmentId: string; status: string; sequence?: number; value?: string | null; marked?: boolean }[] }>(
          `/api/attempts/${attemptId}/answers`,
          {
            method: "PATCH",
            json: {
              answers: [...batch].map(([assignmentId, a]) => ({
                assignmentId,
                value: a.value,
                marked: a.marked,
                expectedSequence: answersRef.current.get(assignmentId)?.sequence ?? 0,
              })),
            },
          },
        );
        writeAnswers((draft) => {
          for (const r of res.results) {
            const local = draft.get(r.assignmentId);
            if (r.status === "saved" && local) draft.set(r.assignmentId, { ...local, sequence: r.sequence! });
            if (r.status === "conflict") {
              // Another tab saved a newer answer; show the stored one instead of overwriting it.
              draft.set(r.assignmentId, { value: r.value ?? null, marked: r.marked ?? false, sequence: r.sequence! });
              pending.current.delete(r.assignmentId);
              setNotice("This test is open in another tab. We've loaded the answer saved there.");
            }
          }
        });
        setSaveState(pending.current.size ? "saving" : "saved");
      } catch (e) {
        if (e instanceof ApiFailure && (e.status === 409 || e.status === 410)) {
          goToResults();
          return;
        }
        // Network or server trouble: keep the answers queued and retry.
        for (const [id, a] of batch) if (!pending.current.has(id)) pending.current.set(id, a);
        setSaveState("retrying");
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => void flushRef.current(), 4000);
      } finally {
        inflight.current = null;
      }
    })();
    await inflight.current;
  }, [attemptId, goToResults, writeAnswers]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  // Debounced autosave.
  const saveSoon = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useCallback(
    (assignmentId: string, change: Partial<Answer>) => {
      const prev = answersRef.current.get(assignmentId) ?? { value: null, marked: false, sequence: 0 };
      const next = { ...prev, ...change };
      writeAnswers((draft) => draft.set(assignmentId, next));
      pending.current.set(assignmentId, { value: next.value, marked: next.marked });
      setSaveState("saving");
      if (saveSoon.current) clearTimeout(saveSoon.current);
      saveSoon.current = setTimeout(() => void flush(), 500);
    },
    [flush, writeAnswers],
  );

  const submit = useCallback(async () => {
    if (finished.current) return;
    setSubmitting(true);
    await flush().catch(() => undefined);
    try {
      await api(`/api/attempts/${attemptId}/submit`, { method: "POST" });
      goToResults();
    } catch (e) {
      setSubmitting(false);
      setNotice(e instanceof Error ? `${e.message} Your answers are saved — try submitting again.` : "Submission failed.");
    }
  }, [attemptId, flush, goToResults]);

  // Clock, corrected for the difference between this device and the server.
  const deadline = data ? Date.parse(data.attempt.deadline) : 0;
  useEffect(() => {
    if (!data) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [data]);
  const remaining = data ? Math.max(0, Math.ceil((deadline - (now + clockOffset)) / 1000)) : 0;
  const autoSubmitted = useRef(false);
  useEffect(() => {
    // Submit once when time runs out; if that fails the notice offers a manual retry.
    if (data && remaining === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void submit();
    }
  }, [data, remaining, submit]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (finished.current) return;
      void flush();
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [flush]);

  useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    if (saveSoon.current) clearTimeout(saveSoon.current);
  }, []);

  if (loadError)
    return (
      <p className="student-warning" role="alert">
        {loadError}
      </p>
    );
  if (!data) return <p role="status">Loading your test…</p>;

  const questions = data.questions;
  const q = questions[current];
  const answer = answers.get(q.assignmentId);
  const section = data.sections.find((s) => s.id === q.sectionId)!;
  const sectionQuestions = questions.filter((x) => x.sectionId === section.id);
  const numberInSection = sectionQuestions.indexOf(q) + 1;

  const statusOf = (item: Question): Status => {
    const a = answers.get(item.assignmentId);
    const isAnswered = Boolean(a?.value);
    if (a?.marked) return isAnswered ? "answered-marked" : "marked";
    if (isAnswered) return "answered";
    return visited.has(item.assignmentId) ? "not-answered" : "not-visited";
  };
  const counts: Record<Status, number> = { "not-visited": 0, "not-answered": 0, answered: 0, marked: 0, "answered-marked": 0 };
  for (const item of questions) counts[statusOf(item)]++;

  const go = (index: number) => {
    const target = questions[Math.max(0, Math.min(questions.length - 1, index))];
    const seen = new Set(visited).add(target.assignmentId);
    setVisited(seen);
    try {
      sessionStorage.setItem(visitedKey, JSON.stringify([...seen]));
    } catch {
      // Ignore storage limits; the palette still works for this session.
    }
    setCurrent(questions.indexOf(target));
    setPaletteOpen(false);
    void flush();
    requestAnimationFrame(() => heading.current?.focus());
  };
  const isLast = current === questions.length - 1;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="exam">
      <header className="exam-bar">
        <div className="exam-bar-title">
          <strong>{data.test.title}</strong>
          <span className={`save-state save-${saveState}`} role="status">
            {saveState === "saved" ? "All answers saved" : saveState === "saving" ? "Saving…" : "Offline — retrying"}
          </span>
        </div>
        <div className={`test-clock${remaining < 300 ? " clock-low" : ""}`} aria-label="Time remaining">
          <Clock3 size={20} aria-hidden="true" />
          <strong>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </strong>
          <span>left</span>
        </div>
        <button className="student-secondary palette-toggle" onClick={() => setPaletteOpen(true)} aria-expanded={paletteOpen}>
          <LayoutGrid size={16} aria-hidden="true" /> Questions
        </button>
      </header>

      {notice && (
        <p className="student-warning" role="alert">
          {notice}{" "}
          {remaining === 0 ? (
            <button className="student-text-button" onClick={submit} disabled={submitting}>
              Submit now
            </button>
          ) : (
            <button className="student-text-button" onClick={() => setNotice("")}>
              Dismiss
            </button>
          )}
        </p>
      )}

      {data.sections.length > 1 && (
        <div className="exam-sections" role="tablist" aria-label="Sections">
          {data.sections.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === section.id}
              onClick={() => go(questions.findIndex((x) => x.sectionId === s.id))}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="test-layout">
        <section className="student-panel question-panel" aria-labelledby="question-title">
          <div className="question-meta">
            <span>{section.name}</span>
            <span>
              +{q.marks} correct · {q.penalty ? `−${q.penalty} wrong` : "no negative marking"}
            </span>
          </div>
          <h2 id="question-title" ref={heading} tabIndex={-1}>
            Question {numberInSection}
            <span> / {sectionQuestions.length}</span>
          </h2>
          <div className="question-prompt">
            <ScientificRenderer content={q.content} />
          </div>
          <fieldset className="answer-options">
            <legend>Choose one answer.</legend>
            {q.options.map((option, i) => (
              <label key={option.key} className={answer?.value === option.key ? "selected" : ""}>
                <input
                  type="radio"
                  name={`answer-${q.assignmentId}`}
                  checked={answer?.value === option.key}
                  onChange={() => queue(q.assignmentId, { value: option.key })}
                />
                <span className="option-letter">{LETTERS[i]}</span>
                <ScientificRenderer content={option.content} />
              </label>
            ))}
          </fieldset>

          <div className="exam-actions">
            <button
              className="button-primary"
              onClick={() => {
                if (answer?.marked) queue(q.assignmentId, { marked: false });
                if (isLast) dialog.current?.showModal();
                else go(current + 1);
              }}
            >
              {isLast ? "Save & finish" : "Save & Next"} <ArrowRight size={17} />
            </button>
            <button
              className="student-secondary mark-button"
              onClick={() => {
                queue(q.assignmentId, { marked: true });
                if (!isLast) go(current + 1);
              }}
            >
              <Flag size={16} /> Mark for Review &amp; Next
            </button>
            <button
              className="student-secondary"
              onClick={() => queue(q.assignmentId, { value: null })}
              disabled={!answer?.value}
            >
              Clear Response
            </button>
            <button className="student-text-button" onClick={() => go(current - 1)} disabled={current === 0}>
              <ArrowLeft size={16} /> Previous
            </button>
          </div>
        </section>

        <aside className={`test-sidebar exam-palette${paletteOpen ? " is-open" : ""}`} aria-label="Question palette">
          <div className="student-panel">
            <div className="section-heading">
              <h2>{section.name}</h2>
              <button className="student-text-button palette-close" onClick={() => setPaletteOpen(false)} aria-label="Close question palette">
                <X size={18} />
              </button>
            </div>
            <div className="question-palette">
              {sectionQuestions.map((item, i) => {
                const status = statusOf(item);
                const index = questions.indexOf(item);
                return (
                  <button
                    key={item.assignmentId}
                    className={`pal-${status}${index === current ? " is-current" : ""}`}
                    aria-current={index === current ? "step" : undefined}
                    aria-label={`Question ${i + 1}: ${STATUS_LABEL[status]}`}
                    onClick={() => go(index)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <ul className="exam-legend">
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <li key={s}>
                  <i className={`pal-${s}`} aria-hidden="true" />
                  {STATUS_LABEL[s]} <strong>{counts[s]}</strong>
                </li>
              ))}
            </ul>
            <button className="button-primary" onClick={() => dialog.current?.showModal()}>
              Submit test <Send size={16} />
            </button>
          </div>
        </aside>
      </div>

      <dialog ref={dialog} className="student-submit-dialog" aria-labelledby="submit-title">
        <h2 id="submit-title">Submit your test?</h2>
        <table className="submit-summary">
          <tbody>
            <tr>
              <th scope="row">Answered</th>
              <td>{counts.answered + counts["answered-marked"]}</td>
            </tr>
            <tr>
              <th scope="row">Marked for review (answered ones are scored)</th>
              <td>{counts.marked + counts["answered-marked"]}</td>
            </tr>
            <tr>
              <th scope="row">Not answered</th>
              <td>{counts["not-answered"] + counts.marked + counts["not-visited"]}</td>
            </tr>
          </tbody>
        </table>
        <p>You can&apos;t change your answers after submitting.</p>
        <div>
          <button className="student-secondary" onClick={() => dialog.current?.close()} disabled={submitting}>
            Back to test
          </button>
          <button className="button-primary" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
