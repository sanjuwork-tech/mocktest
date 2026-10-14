"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FlaskConical,
  Atom,
  Sigma,
  Dna,
  FileSpreadsheet,
  Code2,
  TrendingUp,
  Languages,
  BrainCircuit,
  Globe,
  Landmark,
  Radio,
  Scale,
  Play,
  ChartNoAxesCombined,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  BookOpenCheck,
} from "lucide-react";
import { StudentShell } from "./shell";
import { createSample, useDemo } from "@/lib/student/store";
import { SUBJECTS, analyze, type Subject } from "@/lib/student/model";
import { questionsFor, questionBank } from "@/data/student/bank";

const subjectIcons: Record<string, typeof Sigma> = {
  mathematics: Sigma,
  physics: Atom,
  chemistry: FlaskConical,
  "biological-science": Dna,
  accountancy: FileSpreadsheet,
  "computer-science": Code2,
  economics: TrendingUp,
  english: Languages,
  "general-test": BrainCircuit,
  geography: Globe,
  history: Landmark,
  "mass-media": Radio,
  "political-science": Scale,
};

type ServerAttempt = {
  id: string;
  subject: Subject;
  startedAt: number;
  submittedAt?: number;
  score: number;
  maxScore: number;
  accuracy: number | null;
  status: string;
};

type ExamOption = {
  id: string;
  name: string;
  badge: string;
  subjectsCount: number;
  totalTests: string;
  pattern: string;
  description: string;
  subjectIds: Subject[];
};

const EXAM_OPTIONS: ExamOption[] = [
  {
    id: "cuet-ug",
    name: "CUET (UG)",
    badge: "13 Full Tests Free",
    subjectsCount: 13,
    totalTests: "13 Full-Length Tests (Paper 1 Free)",
    pattern: "50 Questions · 90 Mins · +4 / −1",
    description: "Central, State & Top University Admissions (BA, BSc, BCom, BCA, Engineering)",
    subjectIds: [
      "mathematics",
      "physics",
      "chemistry",
      "biological-science",
      "accountancy",
      "computer-science",
      "economics",
      "english",
      "general-test",
      "geography",
      "history",
      "mass-media",
      "political-science",
    ],
  },
  {
    id: "iiser-iat",
    name: "IISER IAT",
    badge: "Coming Soon",
    subjectsCount: 4,
    totalTests: "Adding in upcoming days",
    pattern: "60 Questions · 180 Mins · +4 / −1",
    description: "Admissions to 7 IISER campuses, IISc Bangalore, and IIT Madras Science Programs",
    subjectIds: ["mathematics", "physics", "chemistry", "biological-science"],
  },
  {
    id: "comedk-uget",
    name: "COMEDK UGET",
    badge: "Coming Soon",
    subjectsCount: 3,
    totalTests: "Adding in upcoming days",
    pattern: "180 Questions · 180 Mins · No Negative",
    description: "Entrance for 190+ top engineering colleges in Karnataka (RVCE, BMSCE, MSRIT)",
    subjectIds: ["physics", "chemistry", "mathematics"],
  },
  {
    id: "niser-nest",
    name: "NISER NEST",
    badge: "Coming Soon",
    subjectsCount: 4,
    totalTests: "Adding in upcoming days",
    pattern: "80 Questions · 210 Mins · Sectional Timing",
    description: "National Screening Test for NISER Bhubaneswar and UM-DAE CEBS Mumbai",
    subjectIds: ["physics", "chemistry", "mathematics", "biological-science"],
  },
];

export function StudentDashboard() {
  const { attempts } = useDemo();
  const router = useRouter();
  const [selectedExamId, setSelectedExamId] = useState<string>("cuet-ug");
  const [studentName, setStudentName] = useState<string>("Aspirant");
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
  const activeExam = EXAM_OPTIONS.find((e) => e.id === selectedExamId) || EXAM_OPTIONS[0];
  const displayedSubjects = SUBJECTS.filter((s) => activeExam.subjectIds.includes(s.id));

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
            Choose your target entrance exam below to explore syllabus patterns, test formats,
            and launch Test 1 diagnostic mocks with live real-time timing.
          </p>
          <Link href="/exams" className="text-link">
            Keep exploring official exam pattern guides <ArrowRight size={16} />
          </Link>
        </div>
        <div className="student-hero-note">
          <span className="student-note-icon">
            <GraduationCap size={32} />
          </span>
          <p>
            One test doesn’t
            <br />
            define your potential.
          </p>
          <strong>What you learn from it can change your next one.</strong>
        </div>
      </section>

      {/* Target Exam Selection Cards */}
      <section style={{ marginBottom: "32px" }}>
        <div style={{ marginBottom: "16px" }}>
          <p className="eyebrow">Step 1: Choose Your Entrance Exam</p>
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "4px 0" }}>
            Select Target Examination
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Switch between examinations to view tailored subjects, question banks, and Test 1 mocks.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {EXAM_OPTIONS.map((exam) => {
            const isSelected = exam.id === selectedExamId;
            return (
              <div
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  border: isSelected ? "2px solid var(--blue, #1f5eff)" : "1px solid #e2e8f0",
                  background: isSelected ? "#f8faff" : "#ffffff",
                  boxShadow: isSelected
                    ? "0 4px 14px rgba(31, 94, 255, 0.12)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: isSelected ? "var(--blue, #1f5eff)" : "#64748b",
                        background: isSelected ? "#e0edff" : "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: "12px",
                      }}
                    >
                      {exam.badge}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--blue, #1f5eff)",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <CheckCircle2 size={14} /> Selected
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>
                    {exam.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.4, margin: "6px 0 12px 0" }}>
                    {exam.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  <div>
                    <strong style={{ color: "#1e293b" }}>{exam.subjectsCount} Subjects</strong> · {exam.totalTests}
                  </div>
                  <div style={{ color: "#059669", fontWeight: 500 }}>{exam.pattern}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Bar */}
      <div className="student-stat-grid">
        <div>
          <span>Active practice library</span>
          <strong>
            {questionBank.length} <small>questions</small>
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
          <span>Selected Exam</span>
          <strong className="student-stat-text">{activeExam.name}</strong>
        </div>
      </div>

      {/* Subjects & Test 1 Launch Section */}
      <section className="student-section">
        {selectedExamId === "cuet-ug" ? (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{activeExam.name} · Available Subjects</p>
                <h2>Launch Full-Length Test 1 Diagnostic Mock</h2>
              </div>
              <span className="student-muted">
                {displayedSubjects.length} subjects available · 50 questions · 90 minutes · 100% Free
              </span>
            </div>

            <div className="student-subject-grid">
              {displayedSubjects.map((s) => {
                const active = attempts.find(
                  (a) => a.subject === s.id && !a.submittedAt,
                );
                const Icon = subjectIcons[s.id] || FlaskConical;
                return (
                  <article
                    key={s.id}
                    className={`student-subject-card student-${s.id}`}
                  >
                    <div className="student-subject-icon" aria-hidden="true">
                      <Icon size={26} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p className="eyebrow">{s.code ? `CUET Code: ${s.code}` : "Domain Practice"}</p>
                      <span
                        style={{
                          fontSize: "11px",
                          background: "#e8f0fe",
                          color: "var(--blue, #1f5eff)",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <CheckCircle2 size={12} /> Full Test 1 Free
                      </span>
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.subtitle}</p>
                    <div className="student-card-facts">
                      <span>50 questions</span>
                      <span>Paper 1</span>
                      <span>200 marks</span>
                    </div>
                    <Link
                      href={`/student/tests/${s.id}`}
                      className="button-primary"
                    >
                      {active ? "Resume test" : "Start Full Test 1"}{" "}
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
            <p className="student-muted" style={{ marginTop: "16px" }}>
              Scoring rules: +4 correct, −1 incorrect, 0 unanswered. Real-time timer runs on both total exam
              and active question to deliver granular pacing insights in your post-test diagnostic report.
            </p>
          </>
        ) : (
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "2px dashed #cbd5e1",
              borderRadius: "20px",
              padding: "48px 32px",
              textAlign: "center",
              maxWidth: "760px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fef3c7",
                color: "#92400e",
                padding: "6px 16px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              Coming Soon · Will Add in Upcoming Days
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              {activeExam.name} Mock Tests Coming Soon
            </h2>
            <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto 24px auto" }}>
              Our faculty and exam experts are currently preparing research-grade test series for <strong>{activeExam.name}</strong>. Full-length mock papers will be added directly into your student dashboard in the upcoming days.
            </p>

            <div
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "center",
                marginBottom: "28px",
              }}
            >
              <span style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", color: "#334155" }}>
                <strong>Pattern:</strong> {activeExam.pattern}
              </span>
              <span style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", color: "#334155" }}>
                <strong>Inclusions:</strong> {activeExam.totalTests}
              </span>
            </div>

            <div style={{ maxWidth: "460px", margin: "0 auto" }}>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>
                In the meantime, you can explore and attempt any of our <strong>13 CUET UG Full-Length Tests</strong> completely free:
              </p>
              <button
                type="button"
                onClick={() => setSelectedExamId("cuet-ug")}
                className="button-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Switch to CUET UG (13 Free Tests) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Attempt History */}
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
            <BookOpenCheck size={36} style={{ color: "#94a3b8", margin: "0 auto 12px auto" }} />
            <h3>Your first learning story starts here.</h3>
            <p>
              Complete Test 1 in any subject above to see your strengths, pacing, questions taking the
              most time, and a practical revision plan.
            </p>
          </div>
        )}
      </section>
    </StudentShell>
  );
}
