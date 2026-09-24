"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface AvailableTest {
  testId: string;
  testTitle: string;
  productTitle: string;
  durationMinutes: number;
  totalMarks: number;
  versionId: string;
}

interface PastAttempt {
  id: string;
  testTitle: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<AvailableTest[]>([]);
  const [attempts, setAttempts] = useState<PastAttempt[]>([]);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/student/auth");
          return;
        }
        setUser(data.user);

        // Fetch tests and attempts in parallel
        const [testsRes, attemptsRes] = await Promise.all([
          fetch("/api/student/tests"),
          fetch("/api/student/attempts")
        ]);

        if (testsRes.ok) {
          const testsData = await testsRes.json();
          setTests(testsData.tests || []);
        }
        
        if (attemptsRes.ok) {
          const attemptsData = await attemptsRes.json();
          setAttempts(attemptsData.attempts || []);
        }

      } catch {
        router.push("/student/auth");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/student/auth");
    router.refresh();
  }, [router]);

  const handleStartTest = useCallback(
    async (versionId: string) => {
      setStarting(versionId);
      try {
        const idempotencyKey = `start-${versionId}-${Date.now()}-${crypto.randomUUID()}`;
        const res = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testVersionId: versionId, idempotencyKey }),
        });
        const data = await res.json();
        if (res.ok && data.attempt?.id) {
          router.push(`/student/exam/${data.attempt.id}`);
        } else {
          alert(data.error || "Failed to start test.");
        }
      } catch {
        alert("Network error. Please try again.");
      } finally {
        setStarting(null);
      }
    },
    [router],
  );

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading your dashboard...</p>
        <style jsx>{`
          .dash-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #94a3b8;
            gap: 1rem;
          }
          .dash-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(96, 165, 250, 0.2);
            border-top-color: #60a5fa;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dash-container">
      <header className="dash-header">
        <div className="dash-brand">
          <h1>TestDisha</h1>
          <span className="dash-badge">Student</span>
        </div>
        <div className="dash-user">
          <span className="dash-user-name">{user?.name}</span>
          <button onClick={handleLogout} className="dash-logout">Sign Out</button>
        </div>
      </header>

      <main className="dash-main">
        <section className="dash-section">
          <h2 className="dash-section-title">📝 Available Tests</h2>
          {tests.length === 0 ? (
            <div className="dash-empty">
              <p>No tests available yet.</p>
              <p className="dash-empty-hint">
                Tests will appear here once you have an active entitlement and published tests are available.
              </p>
            </div>
          ) : (
            <div className="dash-grid">
              {tests.map((test) => (
                <div key={test.versionId} className="dash-test-card">
                  <div className="dash-test-info">
                    <h3>{test.testTitle}</h3>
                    <p className="dash-test-meta">
                      {test.productTitle} · {test.durationMinutes} min · {test.totalMarks} marks
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartTest(test.versionId)}
                    disabled={starting === test.versionId}
                    className="dash-start-btn"
                  >
                    {starting === test.versionId ? "Starting..." : "Start Test"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dash-section">
          <h2 className="dash-section-title">📊 Past Attempts</h2>
          {attempts.length === 0 ? (
            <div className="dash-empty">
              <p>No past attempts yet. Take a test to see your results here.</p>
            </div>
          ) : (
            <div className="dash-grid">
              {attempts.map((a) => (
                <div key={a.id} className="dash-attempt-card">
                  <div>
                    <h3>{a.testTitle}</h3>
                    <p className="dash-test-meta">
                      {new Date(a.startedAt).toLocaleDateString()} · Status:{" "}
                      <span className={`dash-status dash-status-${a.status}`}>{a.status}</span>
                    </p>
                  </div>
                  {a.status === "in_progress" && (
                    <button
                      onClick={() => router.push(`/student/exam/${a.id}`)}
                      className="dash-resume-btn"
                    >
                      Resume
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .dash-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          color: #e2e8f0;
        }
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .dash-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .dash-brand h1 {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }
        .dash-badge {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          background: rgba(96, 165, 250, 0.15);
          color: #60a5fa;
          border-radius: 999px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dash-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .dash-user-name {
          color: #cbd5e1;
          font-size: 0.9rem;
        }
        .dash-logout {
          padding: 0.4rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .dash-logout:hover {
          background: rgba(239, 68, 68, 0.25);
        }
        .dash-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        .dash-section {
          margin-bottom: 2.5rem;
        }
        .dash-section-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: #f1f5f9;
        }
        .dash-empty {
          padding: 2rem;
          text-align: center;
          background: rgba(30, 41, 59, 0.5);
          border: 1px dashed rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          color: #94a3b8;
        }
        .dash-empty p { margin: 0.25rem 0; }
        .dash-empty-hint { font-size: 0.85rem; color: #64748b; }
        .dash-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .dash-test-card, .dash-attempt-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          transition: border-color 0.2s;
        }
        .dash-test-card:hover, .dash-attempt-card:hover {
          border-color: rgba(96, 165, 250, 0.3);
        }
        .dash-test-card h3, .dash-attempt-card h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
          font-weight: 600;
        }
        .dash-test-meta {
          margin: 0;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .dash-start-btn {
          padding: 0.5rem 1.25rem;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .dash-start-btn:hover:not(:disabled) { opacity: 0.9; }
        .dash-start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .dash-resume-btn {
          padding: 0.5rem 1.25rem;
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .dash-resume-btn:hover { background: rgba(34, 197, 94, 0.25); }
        .dash-status {
          font-weight: 600;
          text-transform: capitalize;
        }
        .dash-status-in_progress { color: #fbbf24; }
        .dash-status-submitted { color: #4ade80; }
        .dash-status-timed_out { color: #f87171; }
      `}</style>
    </div>
  );
}
