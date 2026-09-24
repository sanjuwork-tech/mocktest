"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FlaskConical,
  Atom,
  Sigma,
  Play,
  ChartNoAxesCombined,
  CheckCircle2,
} from "lucide-react";
import { StudentShell } from "./shell";
import { createSample, useDemo } from "@/lib/student/store";
import { SUBJECTS, analyze } from "@/lib/student/model";
import { questionsFor } from "@/data/student/bank";

type ServerAttempt = {
  id: string;
  subject: "mathematics" | "physics" | "chemistry";
  startedAt: number;
  submittedAt?: number;
  score: number;
  maxScore: number;
  accuracy: number | null;
  status: string;
};

export function StudentDashboard() {
  const { attempts } = useDemo();
  const router = useRouter();
  const [studentName, setStudentName] = useState<string>("");
  const [serverAttempts, setServerAttempts] = useState<ServerAttempt[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, attRes] = await Promise.all([
          fetch("/api/student/me"),
          fetch("/api/student/attempts"),
        ]);
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.student?.name) setStudentName(meData.student.name);
        }
        if (attRes.ok) {
          const attData = await attRes.json();
          if (Array.isArray(attData.attempts)) {
            setServerAttempts(attData.attempts);
          }
        }
      } catch {
        // Fallback to local state
      }
    }
    loadData();
  }, []);

  const completedLocal = attempts.filter((a) => a.submittedAt && !a.sample);
  const totalCompleted = Math.max(completedLocal.length, serverAttempts.length);

  const answeredCount = completedLocal.reduce((s, a) => {
    const r = analyze(questionsFor(a.subject), a);
    return s + r.right + r.wrong;
  }, serverAttempts.length * 50);

  const firstName = studentName ? studentName.split(" ")[0] : "future explorer";

  return (
    <StudentShell>
      <section className="student-dashboard-hero">
        <div>
          <p className="eyebrow">Your practice. Your possibilities.</p>
          <h1>
            Welcome back,
            <br />
            <em>{firstName}.</em>
          </h1>
          <p>
            A score tells you where you are. Understanding your mistakes helps
            you decide where to go next.
          </p>
          <Link href="/exams" className="text-link">
            Keep exploring your exam options <ArrowRight size={16} />
          </Link>
        </div>
        <div className="student-hero-note">
          <span className="student-note-icon">
            <CompassIcon />
          </span>
          <p>
            One test doesn’t
            <br />
            define your potential.
          </p>
          <strong>What you learn from it can change your next one.</strong>
        </div>
      </section>

      <div className="student-stat-grid">
        <div>
          <span>Practice library</span>
          <strong>
            150 <small>questions</small>
          </strong>
        </div>
        <div>
          <span>Your completed tests</span>
          <strong>{totalCompleted}</strong>
        </div>
        <div>
          <span>Questions attempted</span>
          <strong>{answeredCount}</strong>
        </div>
        <div>
          <span>Your next step</span>
          <strong className="student-stat-text">Start curious.</strong>
        </div>
      </div>

      <section className="student-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose your focus</p>
            <h2>Make room for progress.</h2>
          </div>
          <span className="student-muted">
            50 questions · 90 minutes per subject
          </span>
        </div>

        <div className="student-subject-grid">
          {SUBJECTS.map((s, i) => {
            const active = attempts.find(
              (a) => a.subject === s.id && !a.submittedAt,
            );
            const Icon = [Sigma, Atom, FlaskConical][i];
            return (
              <article
                key={s.id}
                className={`student-subject-card student-${s.id}`}
              >
                <div className="student-subject-icon" aria-hidden="true">
                  <Icon size={26} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p className="eyebrow">Subject practice</p>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "#e8f0fe",
                      color: "var(--blue)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle2 size={12} /> Free Diagnostic Mock
                  </span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.subtitle}</p>
                <div className="student-card-facts">
                  <span>50 questions</span>
                  <span>10 formats</span>
                  <span>200 marks</span>
                </div>
                <Link
                  href={`/student/tests/${s.id}`}
                  className="button-primary"
                >
                  {active ? "Resume test" : "Explore & start test"}{" "}
                  <Play size={15} />
                </Link>
                <button
                  className="student-text-button"
                  onClick={() =>
                    router.push(`/student/results/${createSample(s.id)}`)
                  }
                >
                  <ChartNoAxesCombined size={16} /> Preview sample analysis
                </button>
              </article>
            );
          })}
        </div>
        <p className="student-muted">
          Scoring rules: +4 correct, −1 incorrect, 0 unanswered. Multiple
          answers, matching and ordering use exact-match scoring with no partial
          credit. Answers are autosaved with cloud synchronization and local backup.
        </p>
      </section>

      <section className="student-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your learning trail</p>
            <h2>Every attempt has a next step.</h2>
          </div>
        </div>

        {serverAttempts.length > 0 ? (
          <div className="student-history">
            {serverAttempts.map((a) => (
              <Link key={a.id} href={`/student/results/${a.id}`}>
                <div>
                  <strong>
                    {SUBJECTS.find((s) => s.id === a.subject)?.title || a.subject}
                  </strong>
                  <span>
                    Diagnostic Attempt ·{" "}
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleString("en-IN")
                      : "Completed"}
                  </span>
                </div>
                <strong>
                  {a.score}/{a.maxScore}
                </strong>
                <span>
                  See analysis <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        ) : attempts.some((a) => a.submittedAt) ? (
          <div className="student-history">
            {attempts
              .filter((a) => a.submittedAt)
              .map((a) => {
                const r = analyze(questionsFor(a.subject), a);
                return (
                  <Link key={a.id} href={`/student/results/${a.id}`}>
                    <div>
                      <strong>
                        {SUBJECTS.find((s) => s.id === a.subject)?.title}
                      </strong>
                      <span>
                        {a.sample ? "Simulated sample" : "Your attempt"} ·{" "}
                        {new Date(a.submittedAt!).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <strong>
                      {r.score}/{r.max}
                    </strong>
                    <span>
                      See analysis <ArrowRight size={16} />
                    </span>
                  </Link>
                );
              })}
          </div>
        ) : (
          <div className="student-empty">
            <BookOpenIcon />
            <h3>Your first learning story starts here.</h3>
            <p>
              Complete a test to see your strengths, topics to revisit and a
              practical plan for tomorrow. Or preview a labelled sample above.
            </p>
          </div>
        )}
      </section>
    </StudentShell>
  );
}

function CompassIcon() {
  return <Sigma size={34} aria-hidden="true" />;
}

function BookOpenIcon() {
  return <ChartNoAxesCombined size={30} aria-hidden="true" />;
}
