"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Trophy,
  Sparkles,
  BarChart3,
  Mail,
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
  Calendar,
  ShieldCheck,
  Check,
} from "lucide-react";
import { SUBJECTS, type Subject } from "@/lib/student/model";
import { signIn } from "@/lib/student/store";

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

type ExamTab = "cuet-ug" | "iiser-iat" | "niser-nest" | "comedk";

export function FreeDiagnosticClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ExamTab>("cuet-ug");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistMsg, setWaitlistMsg] = useState("");
  const [startingSubject, setStartingSubject] = useState<string | null>(null);

  const handleStartFullTest = async (subjectId: Subject) => {
    setStartingSubject(subjectId);
    try {
      // Ensure guest session exists if not logged in
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (res.ok) {
        signIn();
      }
    } catch {
      // Offline fallback
      signIn();
    }
    router.push(`/student/tests/${subjectId}`);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent, examSlug: string) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      setWaitlistStatus("error");
      setWaitlistMsg("Please enter a valid email address.");
      return;
    }

    setWaitlistStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail, exam: examSlug }),
      });
      const data = await res.json();
      if (res.ok) {
        setWaitlistStatus("success");
        setWaitlistMsg(data.message || "You're on the waitlist! We'll notify you as soon as tests go live.");
        setWaitlistEmail("");
      } else {
        setWaitlistStatus("error");
        setWaitlistMsg(data.error || "Failed to join waitlist. Please try again.");
      }
    } catch {
      setWaitlistStatus("error");
      setWaitlistMsg("Network issue. Please try again later.");
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      {/* Hero Section */}
      <section style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 48px auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          <Sparkles size={16} /> Free Full-Length Mock Test Attempts
        </div>
        <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.15, color: "#0f172a", marginBottom: "16px" }}>
          Experience the real test.
          <br />
          <em style={{ fontStyle: "normal", color: "var(--blue, #1f5eff)" }}>
            Full-length, timed & completely free.
          </em>
        </h1>
        <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto 28px auto" }}>
          No 15-question samplers. We believe real exam readiness demands attempting the actual <strong>full-length 50-question format</strong> under real CBT conditions with live question timers and instant diagnostic reports.
        </p>

        {/* Quick Highlights Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "16px 20px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#dbeafe", color: "#1d4ed8", padding: "8px", borderRadius: "10px" }}>
              <Clock size={18} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Official 60 Min Timer</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Live per-question timer</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#dcfce7", color: "#15803d", padding: "8px", borderRadius: "10px" }}>
              <Target size={18} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Full 50 Questions</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>250 marks official format (+5/−1)</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#fef3c7", color: "#b45309", padding: "8px", borderRadius: "10px" }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Diagnostic Report</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Pacing & topic mastery</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#f3e8ff", color: "#7e22ce", padding: "8px", borderRadius: "10px" }}>
              <Zap size={18} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Zero Barrier</strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Instant 1-click attempt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Switcher Tabs */}
      <section style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
          {[
            { id: "cuet-ug", label: "CUET (UG)", badge: "13 Tests Live Now · Free" },
            { id: "iiser-iat", label: "IISER IAT", badge: "Coming Soon" },
            { id: "niser-nest", label: "NISER NEST", badge: "Coming Soon" },
            { id: "comedk", label: "COMEDK UGET", badge: "Coming Soon" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as ExamTab);
                  setWaitlistStatus("idle");
                  setWaitlistMsg("");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isSelected ? "2px solid #1f5eff" : "1px solid #cbd5e1",
                  background: isSelected ? "#1f5eff" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#334155",
                  boxShadow: isSelected ? "0 4px 12px rgba(31, 94, 255, 0.2)" : "none",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    background: isSelected ? "rgba(255, 255, 255, 0.25)" : "#f1f5f9",
                    color: isSelected ? "#ffffff" : tab.badge.includes("Live") ? "#15803d" : "#64748b",
                  }}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── CUET UG: Available Now (13 Subjects with Full Tests) ── */}
        {activeTab === "cuet-ug" && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
                border: "1px solid #bfdbfe",
                borderRadius: "16px",
                padding: "24px 28px",
                marginBottom: "28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#1d4ed8",
                    background: "#dbeafe",
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  National Testing Agency (NTA) Official Pattern
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: "8px 0 4px 0" }}>
                  CUET UG Test 1 Full-Length Mocks
                </h2>
                <p style={{ fontSize: "14px", color: "#475569", margin: 0 }}>
                  Select any subject below to attempt the full 50-question mock. Marking: <strong>+5 correct, −1 incorrect</strong>. Complete within 60 minutes (250 marks).
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "13px", color: "#64748b", display: "block" }}>13 Subjects Live</span>
                <strong style={{ fontSize: "18px", color: "#15803d" }}>100% Free Access</strong>
              </div>
            </div>

            {/* Subject Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: "20px",
              }}
            >
              {SUBJECTS.map((s) => {
                const Icon = subjectIcons[s.id] || FlaskConical;
                const isCurrentlyStarting = startingSubject === s.id;
                return (
                  <article
                    key={s.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "22px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            background: "#f0f4ff",
                            color: "var(--blue, #1f5eff)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={24} />
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "#dcfce7",
                            color: "#15803d",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <CheckCircle2 size={12} /> Full Test 1 Free
                        </span>
                      </div>

                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, textTransform: "uppercase" }}>
                        {s.code ? `CUET Code: ${s.code}` : "Domain Practice"}
                      </span>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "4px 0 8px 0" }}>
                        {s.title}
                      </h3>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.45, marginBottom: "16px" }}>
                        {s.subtitle}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          fontSize: "12px",
                          color: "#64748b",
                          background: "#f8fafc",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          marginBottom: "18px",
                        }}
                      >
                        <span>50 Qs</span>
                        <span>·</span>
                        <span>60 Mins</span>
                        <span>·</span>
                        <span>250 Marks</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleStartFullTest(s.id)}
                        disabled={isCurrentlyStarting}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "11px 16px",
                          borderRadius: "10px",
                          background: "var(--blue, #1f5eff)",
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: "14px",
                          cursor: isCurrentlyStarting ? "wait" : "pointer",
                          border: "none",
                          transition: "opacity 0.2s",
                        }}
                      >
                        <Play size={16} />
                        {isCurrentlyStarting ? "Loading Test Player…" : "Attempt Full Length Test"}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/student/results/${s.id}-sample`)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: "transparent",
                          color: "#64748b",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          border: "none",
                        }}
                      >
                        <ChartNoAxesCombined size={14} /> Preview Sample Analysis
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ── IISER IAT: Coming Soon Banner ── */}
        {activeTab === "iiser-iat" && (
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "2px dashed #cbd5e1",
              borderRadius: "20px",
              padding: "48px 32px",
              textAlign: "center",
              maxWidth: "720px",
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
              <Calendar size={16} /> Coming Soon · Will Add in Upcoming Days
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              IISER IAT Test Series Coming Soon
            </h2>
            <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto 24px auto" }}>
              Our academic team is currently calibrating research-aptitude mock tests across <strong>Physics, Chemistry, Mathematics, and Biology</strong> for admission to 7 IISERs, IISc Bangalore, and IIT Madras. Tests will be added here in the upcoming days.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>60 Questions</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>PCMB full pattern</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>180 Minutes</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Timed test simulator</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>+4 / −1 Marking</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>All-India rank benchmark</span>
              </div>
            </div>

            {/* Email Waitlist Form */}
            <form onSubmit={(e) => handleWaitlistSubmit(e, "iiser-iat")} style={{ maxWidth: "440px", margin: "0 auto" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="Enter your email to get notified…"
                  style={{
                    flex: "1 1 240px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "loading"}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "#071A4D",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  {waitlistStatus === "loading" ? "Saving…" : "Notify Me"}
                </button>
              </div>
              {waitlistMsg && (
                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: waitlistStatus === "success" ? "#15803d" : "#b91c1c",
                    fontWeight: 500,
                  }}
                >
                  {waitlistMsg}
                </p>
              )}
            </form>
          </div>
        )}

        {/* ── NISER NEST: Coming Soon Banner ── */}
        {activeTab === "niser-nest" && (
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "2px dashed #cbd5e1",
              borderRadius: "20px",
              padding: "48px 32px",
              textAlign: "center",
              maxWidth: "720px",
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
              <Calendar size={16} /> Coming Soon · Will Add in Upcoming Days
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              NISER NEST Master Series Coming Soon
            </h2>
            <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto 24px auto" }}>
              Integrated MSc entrance mocks for <strong>NISER Bhubaneswar</strong> and <strong>UM-DAE CEBS Mumbai</strong> are arriving shortly with sectional cutoff strategies and high-calibre problems.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>80 Questions</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Sectional science mocks</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>210 Minutes</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Comprehensive duration</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Sectional Strategy</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Cutoff diagnostics</span>
              </div>
            </div>

            {/* Email Waitlist Form */}
            <form onSubmit={(e) => handleWaitlistSubmit(e, "niser-nest")} style={{ maxWidth: "440px", margin: "0 auto" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="Enter your email to get notified…"
                  style={{
                    flex: "1 1 240px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "loading"}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "#071A4D",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  {waitlistStatus === "loading" ? "Saving…" : "Notify Me"}
                </button>
              </div>
              {waitlistMsg && (
                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: waitlistStatus === "success" ? "#15803d" : "#b91c1c",
                    fontWeight: 500,
                  }}
                >
                  {waitlistMsg}
                </p>
              )}
            </form>
          </div>
        )}

        {/* ── COMEDK UGET: Coming Soon Banner ── */}
        {activeTab === "comedk" && (
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              border: "2px dashed #cbd5e1",
              borderRadius: "20px",
              padding: "48px 32px",
              textAlign: "center",
              maxWidth: "720px",
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
              <Calendar size={16} /> Coming Soon · Will Add in Upcoming Days
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              COMEDK UGET Series Coming Soon
            </h2>
            <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, maxWidth: "580px", margin: "0 auto 24px auto" }}>
              Speed-focused test series for top 190+ Karnataka engineering colleges (RVCE, BMSCE, MSRIT) covering <strong>Physics, Chemistry, and Mathematics</strong> without negative marking will be added in upcoming days.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>180 Questions</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Speed PCM practice</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>180 Minutes</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Official timing pace</span>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>No Negative Marking</strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>High accuracy tactics</span>
              </div>
            </div>

            {/* Email Waitlist Form */}
            <form onSubmit={(e) => handleWaitlistSubmit(e, "comedk")} style={{ maxWidth: "440px", margin: "0 auto" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="Enter your email to get notified…"
                  style={{
                    flex: "1 1 240px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "loading"}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "#071A4D",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  {waitlistStatus === "loading" ? "Saving…" : "Notify Me"}
                </button>
              </div>
              {waitlistMsg && (
                <p
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: waitlistStatus === "success" ? "#15803d" : "#b91c1c",
                    fontWeight: 500,
                  }}
                >
                  {waitlistMsg}
                </p>
              )}
            </form>
          </div>
        )}
      </section>

      {/* Trust & Methodology Section */}
      <section
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
            Why Full-Length Tests?
          </h3>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            Short 10-minute samplers can&apos;t measure mental stamina, fatigue, or pacing across 50 questions. Our full-length free tests give you genuine benchmark accuracy.
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
            Real-Time CBT Interface
          </h3>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            Familiarize yourself with the actual question palette, marked for review states, and auto-submission countdown identical to NTA computer-based examinations.
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
            Step-by-Step Solutions
          </h3>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            Every single question is backed by structured explanations, shortcut tips, and topic categorization so you know exactly what to revise.
          </p>
        </div>
      </section>
    </main>
  );
}
