"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Loader2, Send } from "lucide-react";

interface WaitlistFormProps {
  defaultExam?: string;
  headline?: string;
  subheadline?: string;
  source?: string;
}

const EXAM_OPTIONS = [
  { id: "all-access", label: "All-Access Pass (All 4 Exams)" },
  { id: "iiser-iat", label: "IISER IAT 2027 mock series" },
  { id: "niser-nest", label: "NISER NEST 2027 mock series" },
  { id: "comedk", label: "COMEDK UGET 2027 mock series" },
  { id: "bundle-cuet-iiser", label: "CUET + IISER Combo Pass" },
  { id: "bundle-science-trio", label: "Science Trio (IISER + NEST + CUET)" },
  { id: "cuet-ug", label: "CUET UG full series (25 tests per subject)" },
];

export function WaitlistForm({
  defaultExam = "all-access",
  headline = "Join the Priority Waitlist",
  subheadline = "Be the first to know when full test series for IISER IAT, NEST, COMEDK, and multi-exam bundles go live.",
  source = "waitlist_component",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [selectedExam, setSelectedExam] = useState(defaultExam);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid academic or personal email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          exam: selectedExam,
          source,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "You are on the priority waitlist! We will notify you the moment test sets and passes open."
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Unable to join waitlist right now. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please verify your connection and try again.");
    }
  };

  return (
    <section
      id="waitlist"
      style={{
        background: "linear-gradient(135deg, #071A4D 0%, #0D2B7A 100%)",
        borderRadius: "20px",
        padding: "36px 32px",
        color: "#ffffff",
        margin: "32px 0",
        boxShadow: "0 10px 30px rgba(7, 26, 77, 0.2)",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(184, 255, 52, 0.15)",
            color: "#B8FF34",
            padding: "4px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "14px",
          }}
        >
          <Bell size={14} /> Priority Access Notification
        </div>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, margin: "0 0 10px 0", color: "#ffffff" }}>
          {headline}
        </h2>
        <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.82)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
          {subheadline}
        </p>

        {status === "success" ? (
          <div
            style={{
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              borderRadius: "14px",
              padding: "20px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <CheckCircle2 size={24} style={{ color: "#4ade80", flexShrink: 0 }} />
            <div>
              <strong style={{ display: "block", fontSize: "15px", color: "#4ade80" }}>
                Priority spot confirmed!
              </strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "rgba(255, 255, 255, 0.9)" }}>
                {message}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                textAlign: "left",
              }}
            >
              <div>
                <label
                  htmlFor="waitlist-exam"
                  style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}
                >
                  Select Exam / Bundle Series
                </label>
                <select
                  id="waitlist-exam"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                >
                  {EXAM_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} style={{ background: "#071A4D", color: "#ffffff" }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="waitlist-email"
                  style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}
                >
                  Your Email Address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {status === "error" && (
              <p style={{ color: "#f87171", fontSize: "13px", margin: "4px 0 0 0", textAlign: "left" }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                background: "#B8FF34",
                color: "#071A4D",
                border: "none",
                fontWeight: 700,
                fontSize: "15px",
                padding: "13px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "6px",
                transition: "opacity 0.2s ease",
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Adding to waitlist...
                </>
              ) : (
                <>
                  <Send size={16} /> Notify Me on Launch & Early Passes
                </>
              )}
            </button>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
              🔒 Zero spam. We only notify you when your chosen series goes live.
            </span>
          </form>
        )}
      </div>
    </section>
  );
}
