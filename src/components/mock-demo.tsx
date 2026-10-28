"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Clock3, Lightbulb, Pause, Play, Send } from "lucide-react";

// Sample data only. Each exam's numbers follow its official marking:
// CUET 36×5 − 8 = 172/250 · IAT 38×4 − 10 = 142/240 · NEST best three of 39/43/21/35 = 117/180 · COMEDK 128/180.
type Demo = {
  id: string;
  label: string;
  paper: string;
  totalQuestions: number;
  durationMin: number;
  marking: string;
  idealSec: number;
  question: { section: string; text: string; options: string[]; answer: number };
  score: { score: number; max: number; correct: number; wrong: number; unanswered: number };
  sections: { name: string; score: number; max: number; counted: boolean }[];
  quality: { fast: number; slow: number; rushed: number; struggled: number; skipped: number };
  insight: string;
};

const DEMOS: Demo[] = [
  {
    id: "cuet-ug",
    label: "CUET UG",
    paper: "CUET Physics — Test 3",
    totalQuestions: 50,
    durationMin: 60,
    marking: "+5 / −1",
    idealSec: 72,
    question: { section: "Physics", text: "The SI unit of magnetic flux is:", options: ["Tesla", "Weber", "Henry", "Gauss"], answer: 1 },
    score: { score: 172, max: 250, correct: 36, wrong: 8, unanswered: 6 },
    sections: [{ name: "Physics", score: 172, max: 250, counted: true }],
    quality: { fast: 27, slow: 9, rushed: 5, struggled: 3, skipped: 6 },
    insight: "5 answers were rushed and wrong — they cost 5 marks. Read every option before answering.",
  },
  {
    id: "iiser-iat",
    label: "IISER IAT",
    paper: "IISER IAT — Test 2",
    totalQuestions: 60,
    durationMin: 180,
    marking: "+4 / −1",
    idealSec: 180,
    question: { section: "Biology", text: "Which organelle is the main site of aerobic respiration?", options: ["Ribosome", "Mitochondrion", "Golgi body", "Lysosome"], answer: 1 },
    score: { score: 142, max: 240, correct: 38, wrong: 10, unanswered: 12 },
    sections: [
      { name: "Biology", score: 41, max: 60, counted: true },
      { name: "Chemistry", score: 37, max: 60, counted: true },
      { name: "Mathematics", score: 26, max: 60, counted: true },
      { name: "Physics", score: 38, max: 60, counted: true },
    ],
    quality: { fast: 24, slow: 14, rushed: 3, struggled: 7, skipped: 12 },
    insight: "Mathematics took 40% of your time but gave 18% of your marks — set a time limit per question.",
  },
  {
    id: "niser-nest",
    label: "NISER NEST",
    paper: "NEST — Test 1",
    totalQuestions: 80,
    durationMin: 180,
    marking: "+3 / −1 · best 3 sections",
    idealSec: 135,
    question: { section: "Chemistry", text: "The oxidation state of Mn in KMnO₄ is:", options: ["+2", "+4", "+6", "+7"], answer: 3 },
    score: { score: 117, max: 180, correct: 51, wrong: 15, unanswered: 14 },
    sections: [
      { name: "Biology", score: 39, max: 60, counted: true },
      { name: "Chemistry", score: 43, max: 60, counted: true },
      { name: "Mathematics", score: 21, max: 60, counted: false },
      { name: "Physics", score: 35, max: 60, counted: true },
    ],
    quality: { fast: 30, slow: 21, rushed: 6, struggled: 9, skipped: 14 },
    insight: "Mathematics was dropped under best-three scoring — 6 wrong answers there cost time you could have used elsewhere.",
  },
  {
    id: "comedk",
    label: "COMEDK UGET",
    paper: "COMEDK UGET — Test 1",
    totalQuestions: 180,
    durationMin: 180,
    marking: "+1 · no negative marking",
    idealSec: 60,
    question: { section: "Mathematics", text: "The derivative of sin x with respect to x is:", options: ["−cos x", "cos x", "tan x", "−sin x"], answer: 1 },
    score: { score: 128, max: 180, correct: 128, wrong: 40, unanswered: 12 },
    sections: [
      { name: "Physics", score: 41, max: 60, counted: true },
      { name: "Chemistry", score: 46, max: 60, counted: true },
      { name: "Mathematics", score: 41, max: 60, counted: true },
    ],
    quality: { fast: 96, slow: 32, rushed: 18, struggled: 22, skipped: 12 },
    insight: "12 questions left blank with no negative marking — always answer every question before time runs out.",
  },
];

// Seconds spent on 24 sample questions, as a share of the ideal pace (1 = on pace).
const PACE = [0.6, 0.8, 1.4, 0.3, 0.9, 2.1, 0.7, 0.5, 1.1, 0.2, 0.9, 1.6, 0.8, 0.6, 0.4, 1.9, 1, 0.7, 0.3, 0.8, 1.2, 0.5, 2.4, 0.9];
const PACE_QUALITY = ["fast", "fast", "slow", "rushed", "fast", "sink", "fast", "fast", "slow", "rushed", "fast", "struggled", "fast", "fast", "skip", "slow", "fast", "fast", "rushed", "fast", "struggled", "fast", "sink", "fast"];

const STEPS = [
  { id: "attempt", label: "1. Attempt", caption: "Answer on the official pattern: timer, palette, mark for review.", ms: 7000 },
  { id: "submit", label: "2. Submit", caption: "See what's answered and marked before you submit.", ms: 3500 },
  { id: "results", label: "3. Analysis", caption: "Score, time on every question, how you attempted and what to fix next.", ms: 9500 },
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
  const [examIndex, setExamIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const playing = !reducedMotion && !paused;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((t) => {
        if (t + 100 < STEPS[step].ms) return t + 100;
        // After the analysis scene, move on to the next exam.
        if (step === STEPS.length - 1) setExamIndex((e) => (e + 1) % DEMOS.length);
        setStep((s) => (s + 1) % STEPS.length);
        return 0;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, step]);

  const demo = DEMOS[examIndex];
  const t = playing ? elapsed : STEPS[step].ms;
  const go = (i: number) => {
    setStep(i);
    setElapsed(0);
  };

  return (
    <section className="mock-demo" aria-labelledby="mock-demo-title">
      <div className="mock-demo-head">
        <p className="eyebrow">See it in action</p>
        <h2 id="mock-demo-title">From first question to a full analysis — for every exam</h2>
        <p className="section-copy">A walk-through of CUET UG, IISER IAT, NISER NEST and COMEDK UGET mocks. Demo with sample data.</p>
      </div>

      <div className="demo-exams" role="group" aria-label="Exam shown in the demo">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            aria-pressed={examIndex === i}
            onClick={() => {
              setExamIndex(i);
              go(0);
            }}
          >
            {d.label}
          </button>
        ))}
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
        {demo.label}: {STEPS[step].caption}
      </p>

      <div className="demo-screen" aria-hidden="true">
        {STEPS[step].id === "attempt" && <AttemptScene demo={demo} t={t} />}
        {STEPS[step].id === "submit" && <SubmitScene demo={demo} t={t} />}
        {STEPS[step].id === "results" && <ResultsScene demo={demo} t={t} />}
      </div>

      <div className="mock-demo-cta">
        <Link href="/free-diagnostic" className="button-primary">
          Try a real test free <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

const PALETTE = 25;

function AttemptScene({ demo, t }: { demo: Demo; t: number }) {
  const answered = Math.min(PALETTE - 3, Math.floor(t / 300));
  const chosen = t > 2600 ? demo.question.answer : null;
  const secondsLeft = demo.durationMin * 60 - Math.floor(t / 3);
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const clock = `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  return (
    <div className="scene-attempt">
      <div className="scene-bar">
        <strong>{demo.paper}</strong>
        <span className="scene-clock">
          <Clock3 size={14} /> {clock}
        </span>
      </div>
      <div className="scene-body">
        <div className="scene-question">
          <p className="scene-meta">
            {demo.question.section} · Question {answered + 1} · {demo.marking}
          </p>
          <p>{demo.question.text}</p>
          <ul>
            {demo.question.options.map((o, i) => (
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

function SubmitScene({ demo, t }: { demo: Demo; t: number }) {
  return (
    <div className="scene-submit">
      <div className="scene-dialog">
        <strong>Submit your {demo.label} test?</strong>
        <dl>
          <div>
            <dt>Answered</dt>
            <dd>{demo.score.correct + demo.score.wrong}</dd>
          </div>
          <div>
            <dt>Marked for review</dt>
            <dd>4</dd>
          </div>
          <div>
            <dt>Not answered</dt>
            <dd>{demo.score.unanswered}</dd>
          </div>
        </dl>
        <span className={`fake-primary${t > 2000 ? " pressed" : ""}`}>
          <Send size={14} /> {t > 2000 ? "Submitting…" : "Submit"}
        </span>
      </div>
    </div>
  );
}

function ResultsScene({ demo, t }: { demo: Demo; t: number }) {
  const p = Math.min(1, t / 2200);
  const s = demo.score;
  const accuracy = Math.round((s.correct / (s.correct + s.wrong)) * 100);
  const q = demo.quality;
  const qualityTotal = q.fast + q.slow + q.rushed + q.struggled + q.skipped;
  const maxPace = Math.max(...PACE);
  return (
    <div className="scene-results">
      <div className="res-card res-score">
        <span>Score</span>
        <strong>
          {Math.round(s.score * p)}
          <small> / {s.max}</small>
        </strong>
        <em>
          {accuracy}% accuracy · {s.correct} correct · {s.wrong} wrong · {s.unanswered} skipped
        </em>
        <div className="res-sections">
          {demo.sections.map((sec) => (
            <div key={sec.name} className={sec.counted ? "" : "not-counted"}>
              <em>
                {sec.name}
                {sec.counted ? "" : " (dropped)"}
              </em>
              <b>
                <i style={{ width: `${(Math.max(0, sec.score) / sec.max) * 100 * p}%` }} />
              </b>
              <small>{sec.score}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="res-card res-time">
        <span>Time on every question · ideal {demo.idealSec}s</span>
        <div className="mini-time">
          <em className="mini-target" style={{ bottom: `${(1 / maxPace) * 100}%` }} />
          {PACE.map((v, i) => (
            <i key={i} className={`mq-${PACE_QUALITY[i]}`} style={{ height: `${(v / maxPace) * 100 * p}%` }} />
          ))}
        </div>
        <div className="res-quality">
          {(
            [
              ["fast", "On pace, correct", q.fast],
              ["slow", "Correct but slow", q.slow],
              ["rushed", "Rushed & wrong", q.rushed],
              ["struggled", "Wrong after effort", q.struggled],
              ["skip", "Skipped", q.skipped],
            ] as const
          ).map(([k, label, n]) => (
            <div key={k}>
              <i className={`mq-${k}`} style={{ width: `${(n / qualityTotal) * 100 * p}%` }} />
              <small>
                {label} · {n}
              </small>
            </div>
          ))}
        </div>
      </div>
      <p className="res-next">
        <Lightbulb size={16} /> {demo.insight}
      </p>
    </div>
  );
}
