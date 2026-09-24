"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
        const body: Record<string, string> = { email, password };
        if (mode === "register") body.name = name;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }

        if (mode === "register") {
          // After registration, auto-login
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!loginRes.ok) {
            setError("Account created. Please sign in.");
            setMode("login");
            return;
          }
        }

        router.push("/student/dashboard");
        router.refresh();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [mode, name, email, password, router],
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">TestDisha</h1>
          <p className="auth-subtitle">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="name" className="auth-label">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="Enter your full name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="Enter your email"
              required
              maxLength={200}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder={mode === "register" ? "Minimum 8 characters" : "Enter your password"}
              required
              minLength={mode === "register" ? 8 : 1}
              maxLength={128}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => { setMode("register"); setError(""); }} className="auth-link">
                Create one
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => { setMode("login"); setError(""); }} className="auth-link">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.5rem;
        }
        .auth-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .auth-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .auth-input {
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .auth-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
        }
        .auth-input::placeholder {
          color: #475569;
        }
        .auth-error {
          color: #f87171;
          font-size: 0.85rem;
          margin: 0;
          padding: 0.5rem 0.75rem;
          background: rgba(248, 113, 113, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(248, 113, 113, 0.2);
        }
        .auth-submit {
          padding: 0.75rem;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          margin-top: 0.5rem;
        }
        .auth-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .auth-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-switch {
          text-align: center;
          margin-top: 1.5rem;
          color: #94a3b8;
          font-size: 0.85rem;
        }
        .auth-link {
          color: #60a5fa;
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
          text-decoration: underline;
          padding: 0;
        }
        .auth-link:hover {
          color: #93c5fd;
        }
      `}</style>
    </div>
  );
}
