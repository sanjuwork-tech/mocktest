"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";

// ── Types ────────────────────────────────────────
interface Section { id: string; subject: string; position: number; rules: Record<string, unknown>; }
interface Option { key: string; position: number; content: unknown; }
interface Question {
  assignmentId: string; sectionId: string; position: number;
  marks: number; penalty: number; type: string; subject: string;
  content: unknown; options: Option[];
}
interface Answer {
  assignmentId: string; value: unknown; sequence: number;
  marked: boolean; updatedAt: string;
}
interface AttemptState {
  id: string; status: string; serverNow: string;
  deadline: string; startedAt: string; ordering: unknown;
}

type SyncStatus = "idle" | "saving" | "saved" | "error";

// ── Helper: render content blocks to text ────────
function renderBlocks(blocks: unknown): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .map((b: Record<string, unknown>) => {
      if (b.type === "paragraph" && Array.isArray(b.runs)) {
        return b.runs.map((r: Record<string, unknown>) =>
          r.type === "text" ? String(r.value || "") : `$${r.latex || ""}$`
        ).join("");
      }
      if (b.type === "display_math") return `$$${b.latex || ""}$$`;
      return "";
    })
    .join("\n");
}

export default function ExamPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  // ── State ──────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [testInfo, setTestInfo] = useState<{ title: string; durationSeconds: number } | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const serverOffsetRef = useRef(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load attempt ───────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        if (!res.ok) {
          const d = await res.json();
          setError(d.error || "Failed to load test.");
          return;
        }
        const data = await res.json();
        setAttempt(data.attempt);
        setTestInfo(data.test);
        setSections(data.sections || []);
        setQuestions(data.questions || []);

        const ansMap = new Map<string, Answer>();
        for (const a of data.answers || []) ansMap.set(a.assignmentId, a);
        setAnswers(ansMap);

        // Calculate server offset
        const serverNow = new Date(data.attempt.serverNow).getTime();
        serverOffsetRef.current = serverNow - Date.now();

        // Calculate initial time left
        const deadline = new Date(data.attempt.deadline).getTime();
        const now = Date.now() + serverOffsetRef.current;
        setTimeLeft(Math.max(0, Math.floor((deadline - now) / 1000)));
      } catch {
        setError("Network error loading test.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId]);

  // ── Time up handler ────────────────────────────
  const handleTimeUp = useCallback(async () => {
    setAttempt((prev) => (prev ? { ...prev, status: "timed_out" } : prev));
  }, []);

  // ── Timer ──────────────────────────────────────
  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;
    const interval = setInterval(() => {
      if (!attempt) return;
      const deadline = new Date(attempt.deadline).getTime();
      const now = Date.now() + serverOffsetRef.current;
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleTimeUp();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt, handleTimeUp]);

  // ── Format time ────────────────────────────────
  const formattedTime = useMemo(() => {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  // ── Current section questions ──────────────────
  const currentSectionObj = sections[currentSection];
  const sectionQuestions = useMemo(
    () => currentSectionObj ? questions.filter((q) => q.sectionId === currentSectionObj.id) : [],
    [questions, currentSectionObj],
  );
  const currentQ = sectionQuestions[currentQuestion];

  // ── Save answer (debounced) ────────────────────
  const saveAnswer = useCallback(
    async (assignmentId: string, value: unknown, marked?: boolean) => {
      if (!attempt || attempt.status !== "in_progress") return;

      const existing = answers.get(assignmentId);
      const expectedSequence = existing?.sequence ?? 0;

      setSyncStatus("saving");
      try {
        const res = await fetch(`/api/attempts/${attemptId}/answers`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: [{
              assignmentId,
              value,
              expectedSequence,
              marked: marked ?? existing?.marked ?? false,
            }],
          }),
        });
        const data = await res.json();

        if (res.status === 410) {
          // Timed out
          setAttempt((prev) => prev ? { ...prev, status: "timed_out" } : prev);
          setSyncStatus("error");
          return;
        }

        if (data.results) {
          for (const r of data.results) {
            if (r.status === "saved") {
              setAnswers((prev) => {
                const next = new Map(prev);
                next.set(r.assignmentId, {
                  assignmentId: r.assignmentId,
                  value,
                  sequence: r.sequence,
                  marked: marked ?? existing?.marked ?? false,
                  updatedAt: new Date().toISOString(),
                });
                return next;
              });
            }
          }
        }
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus("idle"), 1500);
      } catch {
        setSyncStatus("error");
      }
    },
    [attempt, attemptId, answers],
  );

  // ── Handle option selection ────────────────────
  const handleSelectOption = useCallback(
    (assignmentId: string, optionKey: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      // Optimistically update local state
      const existing = answers.get(assignmentId);
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(assignmentId, {
          assignmentId,
          value: { selectedOptionId: optionKey },
          sequence: (existing?.sequence ?? 0) + 1,
          marked: existing?.marked ?? false,
          updatedAt: new Date().toISOString(),
        });
        return next;
      });
      // Debounce save
      saveTimeoutRef.current = setTimeout(() => {
        saveAnswer(assignmentId, { selectedOptionId: optionKey });
      }, 400);
    },
    [answers, saveAnswer],
  );

  // ── Clear response ─────────────────────────────
  const handleClearResponse = useCallback(
    (assignmentId: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setAnswers((prev) => {
        const next = new Map(prev);
        const existing = prev.get(assignmentId);
        next.set(assignmentId, {
          assignmentId,
          value: null,
          sequence: (existing?.sequence ?? 0) + 1,
          marked: existing?.marked ?? false,
          updatedAt: new Date().toISOString(),
        });
        return next;
      });
      saveTimeoutRef.current = setTimeout(() => {
        saveAnswer(assignmentId, null);
      }, 400);
    },
    [saveAnswer],
  );

  // ── Mark for review ────────────────────────────
  const handleMarkForReview = useCallback(
    (assignmentId: string) => {
      const existing = answers.get(assignmentId);
      const newMarked = !(existing?.marked ?? false);
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(assignmentId, {
          ...(existing || { assignmentId, value: null, sequence: 0, updatedAt: new Date().toISOString() }),
          marked: newMarked,
        });
        return next;
      });
      saveAnswer(assignmentId, existing?.value ?? null, newMarked);
    },
    [answers, saveAnswer],
  );


  // ── Submit ─────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setAttempt((prev) => prev ? { ...prev, status: "submitted" } : prev);
      } else {
        alert(data.error || "Failed to submit.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setShowSubmitModal(false);
  }, [attemptId]);

  // ── Keyboard navigation ────────────────────────
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentQuestion((prev) => Math.min(prev + 1, sectionQuestions.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentQuestion((prev) => Math.max(prev - 1, 0));
      } else if (e.key >= "1" && e.key <= "4" && currentQ) {
        const idx = parseInt(e.key) - 1;
        if (currentQ.options[idx]) {
          handleSelectOption(currentQ.assignmentId, currentQ.options[idx].key);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sectionQuestions, currentQuestion, currentQ, handleSelectOption]);

  // ── Question status helper ─────────────────────
  const getQuestionStatus = useCallback(
    (assignmentId: string): "not-visited" | "answered" | "unanswered" | "marked" => {
      const ans = answers.get(assignmentId);
      if (!ans) return "not-visited";
      if (ans.marked) return "marked";
      if (ans.value && typeof ans.value === "object" && (ans.value as Record<string, unknown>).selectedOptionId) return "answered";
      return "unanswered";
    },
    [answers],
  );

  // ── Stats ──────────────────────────────────────
  const stats = useMemo(() => {
    let answered = 0, unanswered = 0, marked = 0, notVisited = 0;
    for (const q of questions) {
      const s = getQuestionStatus(q.assignmentId);
      if (s === "answered") answered++;
      else if (s === "unanswered") unanswered++;
      else if (s === "marked") marked++;
      else notVisited++;
    }
    return { answered, unanswered, marked, notVisited, total: questions.length };
  }, [questions, getQuestionStatus]);

  // ── Loading & Error States ─────────────────────
  if (loading) {
    return (
      <div className="exam-loading">
        <div className="exam-spinner" />
        <p>Loading your test...</p>
        <style jsx>{`
          .exam-loading { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f172a; color:#94a3b8; gap:1rem; }
          .exam-spinner { width:32px; height:32px; border:3px solid rgba(96,165,250,0.2); border-top-color:#60a5fa; border-radius:50%; animation:spin 0.8s linear infinite; }
          @keyframes spin { to { transform:rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/student/dashboard")}>Back to Dashboard</button>
        <style jsx>{`
          .exam-error { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f172a; color:#f87171; gap:1rem; text-align:center; }
          .exam-error button { padding:0.5rem 1.5rem; background:#3b82f6; color:white; border:none; border-radius:8px; cursor:pointer; }
        `}</style>
      </div>
    );
  }

  // ── Finalized State ────────────────────────────
  if (attempt && attempt.status !== "in_progress") {
    return (
      <div className="exam-done">
        <div className="exam-done-card">
          <h2>{attempt.status === "submitted" ? "✅ Test Submitted" : "⏰ Time Up"}</h2>
          <p>
            {attempt.status === "submitted"
              ? "Your answers have been recorded. Results will be available once scoring is processed."
              : "Your time has expired. All saved answers have been recorded."}
          </p>
          <div className="exam-done-stats">
            <div className="stat">
              <span className="stat-num">{stats.answered}</span>
              <span className="stat-label">Answered</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.unanswered + stats.notVisited}</span>
              <span className="stat-label">Unanswered</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <button onClick={() => router.push("/student/dashboard")} className="exam-done-btn">
            Back to Dashboard
          </button>
        </div>
        <style jsx>{`
          .exam-done { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#e2e8f0; padding:1rem; }
          .exam-done-card { max-width:480px; background:rgba(30,41,59,0.8); backdrop-filter:blur(20px); border:1px solid rgba(148,163,184,0.15); border-radius:16px; padding:2.5rem; text-align:center; }
          .exam-done-card h2 { margin:0 0 1rem; font-size:1.5rem; }
          .exam-done-card p { color:#94a3b8; margin:0 0 2rem; }
          .exam-done-stats { display:flex; justify-content:center; gap:2rem; margin-bottom:2rem; }
          .stat { display:flex; flex-direction:column; align-items:center; }
          .stat-num { font-size:1.5rem; font-weight:700; color:#60a5fa; }
          .stat-label { font-size:0.75rem; color:#94a3b8; text-transform:uppercase; }
          .exam-done-btn { padding:0.75rem 2rem; background:linear-gradient(135deg,#3b82f6,#6366f1); color:white; border:none; border-radius:10px; font-weight:600; cursor:pointer; }
        `}</style>
      </div>
    );
  }

  // ── Active Exam UI ─────────────────────────────
  const selectedAnswer = currentQ ? answers.get(currentQ.assignmentId) : null;
  const selectedOptionKey = selectedAnswer?.value && typeof selectedAnswer.value === "object"
    ? (selectedAnswer.value as Record<string, string>).selectedOptionId
    : null;

  return (
    <div className="exam-container">
      {/* ── Header ── */}
      <header className="exam-header">
        <div className="exam-header-left">
          <h1 className="exam-title">{testInfo?.title || "Test"}</h1>
          <span className={`sync-indicator sync-${syncStatus}`}>
            {syncStatus === "saving" ? "Saving..." : syncStatus === "saved" ? "Saved ✓" : syncStatus === "error" ? "Unsynced ⚠" : ""}
          </span>
        </div>
        <div className="exam-header-right">
          <div className={`exam-timer ${timeLeft <= 300 ? "timer-warning" : ""} ${timeLeft <= 60 ? "timer-danger" : ""}`}>
            🕐 {formattedTime}
          </div>
          <button onClick={() => setShowSubmitModal(true)} className="submit-btn">
            Submit Test
          </button>
        </div>
      </header>

      {/* ── Section Tabs ── */}
      <nav className="section-tabs">
        {sections.map((sec, i) => {
          const secQs = questions.filter((q) => q.sectionId === sec.id);
          const secAnswered = secQs.filter((q) => getQuestionStatus(q.assignmentId) === "answered").length;
          return (
            <button
              key={sec.id}
              onClick={() => { setCurrentSection(i); setCurrentQuestion(0); }}
              className={`section-tab ${i === currentSection ? "section-tab-active" : ""}`}
            >
              {sec.subject.charAt(0).toUpperCase() + sec.subject.slice(1)}
              <span className="section-count">{secAnswered}/{secQs.length}</span>
            </button>
          );
        })}
        <button onClick={() => setShowPalette(!showPalette)} className="palette-toggle">
          {showPalette ? "Hide" : "Show"} Palette
        </button>
      </nav>

      <div className="exam-body">
        {/* ── Question Area ── */}
        <main className="question-area">
          {currentQ ? (
            <>
              <div className="question-header">
                <span className="question-num">Question {currentQ.position + 1}</span>
                <span className="question-marks">
                  +{currentQ.marks} / −{currentQ.penalty}
                </span>
              </div>

              <div className="question-stem">
                {renderBlocks(currentQ.content)}
              </div>

              <div className="options-list">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectOption(currentQ.assignmentId, opt.key)}
                    className={`option-btn ${selectedOptionKey === opt.key ? "option-selected" : ""}`}
                  >
                    <span className="option-label">{String.fromCharCode(65 + i)}</span>
                    <span className="option-text">{renderBlocks(opt.content)}</span>
                  </button>
                ))}
              </div>

              <div className="question-actions">
                <button onClick={() => handleClearResponse(currentQ.assignmentId)} className="action-btn clear-btn">
                  Clear Response
                </button>
                <button
                  onClick={() => handleMarkForReview(currentQ.assignmentId)}
                  className={`action-btn review-btn ${answers.get(currentQ.assignmentId)?.marked ? "review-active" : ""}`}
                >
                  {answers.get(currentQ.assignmentId)?.marked ? "★ Marked" : "☆ Mark for Review"}
                </button>
              </div>

              <div className="question-nav">
                <button
                  onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                  disabled={currentQuestion === 0}
                  className="nav-btn"
                >
                  ← Previous
                </button>
                <span className="nav-info">{currentQuestion + 1} / {sectionQuestions.length}</span>
                <button
                  onClick={() => setCurrentQuestion((p) => Math.min(sectionQuestions.length - 1, p + 1))}
                  disabled={currentQuestion === sectionQuestions.length - 1}
                  className="nav-btn"
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <p className="no-questions">No questions in this section.</p>
          )}
        </main>

        {/* ── Question Palette ── */}
        {showPalette && (
          <aside className="palette">
            <h3 className="palette-title">Question Palette</h3>
            <div className="palette-legend">
              <span className="legend-item"><span className="legend-dot dot-answered" /> Answered</span>
              <span className="legend-item"><span className="legend-dot dot-unanswered" /> Visited</span>
              <span className="legend-item"><span className="legend-dot dot-marked" /> Review</span>
              <span className="legend-item"><span className="legend-dot dot-not-visited" /> Not Visited</span>
            </div>
            <div className="palette-grid">
              {sectionQuestions.map((q, i) => {
                const status = getQuestionStatus(q.assignmentId);
                return (
                  <button
                    key={q.assignmentId}
                    onClick={() => setCurrentQuestion(i)}
                    className={`palette-btn palette-${status} ${i === currentQuestion ? "palette-current" : ""}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="palette-stats">
              <p>Answered: <strong>{stats.answered}</strong> / {stats.total}</p>
              <p>Marked: <strong>{stats.marked}</strong></p>
            </div>
          </aside>
        )}
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Submit Test?</h2>
            <p>Please review before submitting:</p>
            <div className="modal-stats">
              <p>✅ Answered: <strong>{stats.answered}</strong></p>
              <p>❌ Unanswered: <strong>{stats.unanswered + stats.notVisited}</strong></p>
              <p>⭐ Marked for Review: <strong>{stats.marked}</strong></p>
            </div>
            {(stats.unanswered + stats.notVisited) > 0 && (
              <p className="modal-warning">
                ⚠ You have {stats.unanswered + stats.notVisited} unanswered questions.
              </p>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowSubmitModal(false)} className="modal-cancel">Go Back</button>
              <button onClick={handleSubmit} className="modal-submit">Confirm Submit</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .exam-container { min-height:100vh; background:#0f172a; color:#e2e8f0; display:flex; flex-direction:column; }
        .exam-header { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1.5rem; background:rgba(30,41,59,0.9); backdrop-filter:blur(12px); border-bottom:1px solid rgba(148,163,184,0.1); position:sticky; top:0; z-index:20; }
        .exam-header-left { display:flex; align-items:center; gap:1rem; }
        .exam-header-right { display:flex; align-items:center; gap:1rem; }
        .exam-title { font-size:1rem; font-weight:600; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:300px; }
        .sync-indicator { font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px; }
        .sync-saving { color:#fbbf24; background:rgba(251,191,36,0.1); }
        .sync-saved { color:#4ade80; background:rgba(74,222,128,0.1); }
        .sync-error { color:#f87171; background:rgba(248,113,113,0.15); }
        .exam-timer { font-size:1.1rem; font-weight:700; font-variant-numeric:tabular-nums; padding:0.4rem 1rem; background:rgba(30,41,59,0.6); border:1px solid rgba(148,163,184,0.15); border-radius:8px; }
        .timer-warning { color:#fbbf24; border-color:rgba(251,191,36,0.3); }
        .timer-danger { color:#f87171; border-color:rgba(248,113,113,0.4); animation:pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .submit-btn { padding:0.5rem 1.25rem; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; border:none; border-radius:8px; font-weight:600; font-size:0.85rem; cursor:pointer; transition:opacity 0.2s; }
        .submit-btn:hover { opacity:0.9; }
        .section-tabs { display:flex; gap:0.25rem; padding:0.5rem 1.5rem; background:rgba(15,23,42,0.8); border-bottom:1px solid rgba(148,163,184,0.08); overflow-x:auto; flex-shrink:0; }
        .section-tab { padding:0.5rem 1rem; background:transparent; color:#94a3b8; border:1px solid transparent; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:500; display:flex; align-items:center; gap:0.5rem; white-space:nowrap; transition:all 0.2s; }
        .section-tab:hover { color:#e2e8f0; background:rgba(148,163,184,0.08); }
        .section-tab-active { color:#60a5fa; background:rgba(96,165,250,0.1); border-color:rgba(96,165,250,0.3); }
        .section-count { font-size:0.7rem; padding:0.1rem 0.4rem; background:rgba(148,163,184,0.15); border-radius:4px; }
        .palette-toggle { margin-left:auto; padding:0.4rem 0.75rem; background:rgba(148,163,184,0.1); color:#94a3b8; border:1px solid rgba(148,163,184,0.15); border-radius:6px; cursor:pointer; font-size:0.8rem; }
        .exam-body { display:flex; flex:1; overflow:hidden; }
        .question-area { flex:1; padding:1.5rem 2rem; overflow-y:auto; max-height:calc(100vh - 120px); }
        .question-header { display:flex; justify-content:space-between; margin-bottom:1rem; }
        .question-num { font-size:0.85rem; font-weight:600; color:#60a5fa; text-transform:uppercase; letter-spacing:0.05em; }
        .question-marks { font-size:0.8rem; color:#94a3b8; background:rgba(148,163,184,0.1); padding:0.2rem 0.6rem; border-radius:4px; }
        .question-stem { font-size:1rem; line-height:1.7; margin-bottom:1.5rem; white-space:pre-wrap; }
        .options-list { display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem; }
        .option-btn { display:flex; align-items:flex-start; gap:0.75rem; padding:0.85rem 1rem; background:rgba(30,41,59,0.5); border:1px solid rgba(148,163,184,0.15); border-radius:10px; cursor:pointer; text-align:left; color:#e2e8f0; font-size:0.95rem; transition:all 0.15s; }
        .option-btn:hover { border-color:rgba(96,165,250,0.4); background:rgba(96,165,250,0.05); }
        .option-selected { border-color:#3b82f6; background:rgba(59,130,246,0.1); box-shadow:0 0 0 2px rgba(59,130,246,0.2); }
        .option-label { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:rgba(148,163,184,0.15); font-weight:600; font-size:0.85rem; flex-shrink:0; }
        .option-selected .option-label { background:#3b82f6; color:white; }
        .option-text { padding-top:0.2rem; white-space:pre-wrap; }
        .question-actions { display:flex; gap:0.75rem; margin-bottom:1.5rem; }
        .action-btn { padding:0.5rem 1rem; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:500; transition:all 0.2s; }
        .clear-btn { background:rgba(148,163,184,0.1); color:#94a3b8; border:1px solid rgba(148,163,184,0.15); }
        .clear-btn:hover { color:#e2e8f0; background:rgba(148,163,184,0.15); }
        .review-btn { background:rgba(251,191,36,0.1); color:#fbbf24; border:1px solid rgba(251,191,36,0.2); }
        .review-btn:hover { background:rgba(251,191,36,0.15); }
        .review-active { background:rgba(251,191,36,0.2); border-color:rgba(251,191,36,0.4); }
        .question-nav { display:flex; align-items:center; justify-content:space-between; padding-top:1rem; border-top:1px solid rgba(148,163,184,0.1); }
        .nav-btn { padding:0.5rem 1.25rem; background:rgba(96,165,250,0.1); color:#60a5fa; border:1px solid rgba(96,165,250,0.2); border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:500; transition:all 0.2s; }
        .nav-btn:hover:not(:disabled) { background:rgba(96,165,250,0.2); }
        .nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .nav-info { color:#94a3b8; font-size:0.85rem; }
        .no-questions { color:#64748b; text-align:center; padding:3rem; }
        .palette { width:260px; background:rgba(30,41,59,0.5); border-left:1px solid rgba(148,163,184,0.1); padding:1rem; overflow-y:auto; max-height:calc(100vh - 120px); }
        .palette-title { font-size:0.9rem; font-weight:600; margin:0 0 0.75rem; }
        .palette-legend { display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem; font-size:0.7rem; color:#94a3b8; }
        .legend-item { display:flex; align-items:center; gap:0.25rem; }
        .legend-dot { width:10px; height:10px; border-radius:3px; }
        .dot-answered { background:#4ade80; }
        .dot-unanswered { background:#f87171; }
        .dot-marked { background:#fbbf24; }
        .dot-not-visited { background:#475569; }
        .palette-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:0.35rem; margin-bottom:1rem; }
        .palette-btn { width:100%; aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600; border:2px solid transparent; transition:all 0.15s; }
        .palette-answered { background:rgba(74,222,128,0.2); color:#4ade80; border-color:rgba(74,222,128,0.3); }
        .palette-unanswered { background:rgba(248,113,113,0.15); color:#f87171; border-color:rgba(248,113,113,0.2); }
        .palette-marked { background:rgba(251,191,36,0.15); color:#fbbf24; border-color:rgba(251,191,36,0.3); }
        .palette-not-visited { background:rgba(71,85,105,0.3); color:#94a3b8; border-color:rgba(71,85,105,0.3); }
        .palette-current { box-shadow:0 0 0 2px #60a5fa; }
        .palette-stats { font-size:0.8rem; color:#94a3b8; }
        .palette-stats p { margin:0.25rem 0; }
        .palette-stats strong { color:#e2e8f0; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:50; padding:1rem; }
        .modal-card { max-width:420px; width:100%; background:rgba(30,41,59,0.95); backdrop-filter:blur(20px); border:1px solid rgba(148,163,184,0.2); border-radius:16px; padding:2rem; }
        .modal-card h2 { margin:0 0 0.5rem; font-size:1.25rem; }
        .modal-card p { color:#94a3b8; margin:0 0 1rem; font-size:0.9rem; }
        .modal-stats { margin-bottom:1rem; }
        .modal-stats p { margin:0.25rem 0; font-size:0.9rem; color:#e2e8f0; }
        .modal-warning { color:#fbbf24; background:rgba(251,191,36,0.1); padding:0.5rem 0.75rem; border-radius:8px; border:1px solid rgba(251,191,36,0.2); font-size:0.85rem; }
        .modal-actions { display:flex; gap:0.75rem; margin-top:1.5rem; }
        .modal-cancel { flex:1; padding:0.6rem; background:rgba(148,163,184,0.1); color:#94a3b8; border:1px solid rgba(148,163,184,0.2); border-radius:8px; cursor:pointer; font-weight:500; }
        .modal-submit { flex:1; padding:0.6rem; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; }
      `}</style>
    </div>
  );
}
