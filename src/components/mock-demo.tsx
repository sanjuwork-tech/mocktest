"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Clock3, Pause, Play, Send } from "lucide-react";

// Sample data for the demo. It is internally consistent: 36 correct and 8 wrong out of 50 at +5/−1 = 172/250.
const SCORE = { correct: 36, wrong: 8, unanswered: 6, score: 172, max: 250 };
const TOPICS = [
  { name: "Electrostatics", correct: 7, total: 9 },
  { name: "Current Electricity", correct: 6, total: 8 },
  { name: "Magnetism", correct: 5, total: 9 },
  { name: "Optics", correct: 6, total: 9 },
  { name: "Modern Physics", correct: 7, total: 8 },
  { name: "Electronic Devices", correct: 5, total: 7 },
];
const HISTORY = [
  { test: "Test 1", score: 131 },
  { test: "Test 2", score: 154 },
  { test: "Test 3", score: 172 },
];
const QUESTIONS = [
  { text: "Two identical charges repel with force F. If the distance between them is halved, the force becomes:", options: ["F/4", "F/2", "2F", "4F"], answer: 3 },
  { text: "The SI unit of magnetic flux is:", options: ["Tesla", "Weber", "Henry", "Gauss"], answer: 1 },
  { text: "Which colour of visible light has the smallest wavelength?", options: ["Red", "Yellow", "Green", "Violet"], answer: 3 },
];
const PALETTE = 25;

const STEPS = [
  { id: "attempt", label: "1. Attempt", caption: "Answer on the official pattern: timer, palette, mark for review.", ms: 9000 },
  { id: "submit", label: "2. Submit", caption: "See what's answered and marked before you submit.", ms: 4000 },
  { id: "results", label: "3. Results", caption: "Your score, accuracy, topics to revise and progress across tests.", ms: 10000 },
] as const;

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function MockDemo() {
  // Autoplay only for users who haven't asked for reduced motion; the server render never autoplays.
  const reducedMotion = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const playing = !reducedMotion && !paused;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((t) => {
        if (t + 100 < STEPS[step].ms) return t + 100;
        setStep((s) => (s + 1) % STEPS.length);
        return 0;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, step]);

  // With autoplay off, each scene is shown in its finished state.
  const t = playing ? elapsed : STEPS[step].ms;
  const go = (i: number) => {
    setStep(i);
    setElapsed(0);
  };

  return (
    <section className="mock-demo" aria-labelledby="mock-demo-title">
      <div className="mock-demo-head">
        <p className="eyebrow">See it in action</p>
        <h2 id="mock-demo-title">From first question to results dashboard</h2>
        <p className="section-copy">A 20-second walk-through of a CUET Physics mock. Demo with sample data.</p>
      </div>

      <div className="mock-demo-controls">
        <div role="tablist" aria-label="Demo steps">
          {STEPS.map((s, i) => (
            <button key={s.id} role="tab" aria-selected={step === i} onClick={() => go(i)}>
              {s.label}
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <button className="demo-play" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play demo" : "Pause demo"}>
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
      </div>
      <div className="demo-progress" aria-hidden="true">
        <span style={{ width: `${(t / STEPS[step].ms) * 100}%` }} />
      </div>
      <p className="demo-caption" aria-live="polite">
        {STEPS[step].caption}
      </p>

      <div className="demo-screen" aria-hidden="true">
        {STEPS[step].id === "attempt" && <AttemptScene t={t} />}
        {STEPS[step].id === "submit" && <SubmitScene t={t} />}
        {STEPS[step].id === "results" && <ResultsScene t={t} />}
      </div>

      <div className="mock-demo-cta">
        <Link href="/free-diagnostic" className="button-primary">
          Try a real test free <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function AttemptScene({ t }: { t: number }) {
  const answered = Math.min(PALETTE - 3, Math.floor(t / 380));
  const qIndex = Math.floor(t / 3000) % QUESTIONS.length;
  const q = QUESTIONS[qIndex];
  const chosen = t % 3000 > 1400 ? q.answer : null;
  const secondsLeft = 3600 - Math.floor(t / 4);
  return (
    <div className="scene-attempt">
      <div className="scene-bar">
        <strong>CUET Physics — Test 3</strong>
        <span className="scene-clock">
          <Clock3 size={14} /> {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
        </span>
      </div>
      <div className="scene-body">
        <div className="scene-question">
          <p className="scene-meta">Question {answered + 1} / 50 · +5 / −1</p>
          <p>{q.text}</p>
          <ul>
            {q.options.map((o, i) => (
              <li key={o} className={chosen === i ? "picked" : ""}>
                <span>{String.fromCharCode(65 + i)}</span> {o}
              </li>
            ))}
          </ul>
          <div className="scene-actions">
            <span className="fake-primary">Save &amp; Next</span>
            <span className="fake-secondary">Mark for Review &amp; Next</span>
          </div>
        </div>
        <div className="scene-palette">
          {Array.from({ length: PALETTE }, (_, i) => {
            const state = i < answered ? (i % 7 === 3 ? "marked" : i % 9 === 5 ? "not-answered" : "answered") : i === answered ? "current" : "not-visited";
            return <i key={i} className={`dot-${state}`}>{i + 1}</i>;
          })}
        </div>
      </div>
    </div>
  );
}

function SubmitScene({ t }: { t: number }) {
  return (
    <div className="scene-submit">
      <div className="scene-dialog">
        <strong>Submit your test?</strong>
        <dl>
          <div>
            <dt>Answered</dt>
            <dd>{SCORE.correct + SCORE.wrong}</dd>
          </div>
          <div>
            <dt>Marked for review</dt>
            <dd>3</dd>
          </div>
          <div>
            <dt>Not answered</dt>
            <dd>{SCORE.unanswered}</dd>
          </div>
        </dl>
        <span className={`fake-primary${t > 2200 ? " pressed" : ""}`}>
          <Send size={14} /> {t > 2200 ? "Submitting…" : "Submit"}
        </span>
      </div>
    </div>
  );
}

function ResultsScene({ t }: { t: number }) {
  const p = Math.min(1, t / 2500);
  const accuracy = Math.round((SCORE.correct / (SCORE.correct + SCORE.wrong)) * 100);
  const circumference = 2 * Math.PI * 34;
  // Scale the trend line to the range of scores so progress is visible.
  const scores = HISTORY.map((h) => h.score);
  const lo = Math.min(...scores) - 10;
  const hi = Math.max(...scores) + 10;
  const y = (score: number) => 70 - ((score - lo) / (hi - lo)) * 60;
  const points = HISTORY.map((h, i) => `${20 + i * 90},${y(h.score)}`).join(" ");
  return (
    <div className="scene-results">
      <div className="res-card res-score">
        <span>Score</span>
        <strong>
          {Math.round(SCORE.score * p)}
          <small> / {SCORE.max}</small>
        </strong>
        <em>
          {SCORE.correct} correct · {SCORE.wrong} wrong · {SCORE.unanswered} skipped
        </em>
      </div>
      <div className="res-card res-ring">
        <svg viewBox="0 0 80 80" width="96" height="96">
          <circle cx="40" cy="40" r="34" className="ring-bg" />
          <circle
            cx="40"
            cy="40"
            r="34"
            className="ring-fg"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - (accuracy / 100) * p)}
          />
          <text x="40" y="45" textAnchor="middle">
            {Math.round(accuracy * p)}%
          </text>
        </svg>
        <span>Accuracy on attempted</span>
      </div>
      <div className="res-card res-topics">
        <span>Topics</span>
        {TOPICS.map((topic) => (
          <div key={topic.name} className="res-topic">
            <em>{topic.name}</em>
            <b>
              <i style={{ width: `${(topic.correct / topic.total) * 100 * p}%` }} />
            </b>
            <small>
              {topic.correct}/{topic.total}
            </small>
          </div>
        ))}
      </div>
      <div className="res-card res-board">
        <span>Scoreboard</span>
        <svg viewBox="0 0 220 80" width="100%" height="80" preserveAspectRatio="none">
          <polyline points={points} className="spark" style={{ strokeDashoffset: 300 * (1 - p) }} />
          {HISTORY.map((h, i) => (
            <circle key={h.test} cx={20 + i * 90} cy={y(h.score)} r="4" className="spark-dot" />
          ))}
        </svg>
        <table>
          <tbody>
            {HISTORY.map((h, i) => (
              <tr key={h.test}>
                <td>{h.test}</td>
                <td>{h.score} / {SCORE.max}</td>
                <td className="up">{i ? `+${h.score - HISTORY[i - 1].score}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="res-next">Next: revise Magnetism, then take Test 4</p>
      </div>
    </div>
  );
}
