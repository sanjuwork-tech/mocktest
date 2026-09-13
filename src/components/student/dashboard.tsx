"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FlaskConical,
  Atom,
  Sigma,
  Play,
  ChartNoAxesCombined,
} from "lucide-react";
import { StudentShell } from "./shell";
import { createSample, useDemo } from "@/lib/student/store";
import { SUBJECTS, analyze } from "@/lib/student/model";
import { questionsFor } from "@/data/student/bank";
export function StudentDashboard() {
  const { attempts } = useDemo();
  const router = useRouter();
  const completed = attempts.filter((a) => a.submittedAt && !a.sample);
  const answered = completed.reduce((s, a) => {
    const r = analyze(questionsFor(a.subject), a);
    return s + r.right + r.wrong;
  }, 0);
  return (
    <StudentShell>
      <section className="student-dashboard-hero">
        <div>
          <p className="eyebrow">Your practice. Your possibilities.</p>
          <h1>
            Welcome back,
            <br />
            <em>future explorer.</em>
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
          <strong>{completed.length}</strong>
        </div>
        <div>
          <span>Questions attempted</span>
          <strong>{answered}</strong>
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
                <div className="student-subject-icon">
                  <Icon size={26} />
                </div>
                <p className="eyebrow">Subject practice · Demo 01</p>
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
          Demo scoring: +4 correct, −1 incorrect, 0 unanswered. Multiple
          answers, matching and ordering use exact-match scoring with no partial
          credit. Sample analysis is simulated and never counts toward your
          progress.
        </p>
      </section>
      <section className="student-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your learning trail</p>
            <h2>Every attempt has a next step.</h2>
          </div>
        </div>
        {attempts.some((a) => a.submittedAt) ? (
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
  return <Sigma size={34} />;
}
function BookOpenIcon() {
  return <ChartNoAxesCombined size={30} />;
}
