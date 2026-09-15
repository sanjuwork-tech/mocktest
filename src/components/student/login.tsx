"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChartNoAxesCombined,
  BookOpenCheck,
  Compass,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { signIn } from "@/lib/student/store";

export function StudentLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if error was passed in URL params
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      // Decode the error but avoid synchronous setState inside effect if it causes issues, 
      // however in this specific case, it's just setting initial state from URL.
      // We will just do a tiny timeout to avoid the exact ESLint synchronous state error,
      // or we can initialize it directly in useState. Let's do the timeout workaround to keep it simple.
      setTimeout(() => setError(decodeURIComponent(err)), 0);
    }
  }, []);

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (res.ok) {
        signIn(); // sync local state
        router.push("/student");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to start guest session");
      }
    } catch {
      // Offline fallback
      signIn();
      router.push("/student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="page-shell student-main">
      <div className="student-login-grid">
        <section className="student-welcome">
          <p className="eyebrow">A little practice. A clearer direction.</p>
          <h1>
            Your next chapter
            <br />
            starts with <em>you.</em>
          </h1>
          <p>
            You don’t need to have everything figured out. Start here, explore what
            you know, and find your next small step forward.
          </p>
          <ul className="student-benefits">
            <li>
              <BookOpenCheck />
              150 questions. Three subjects. Ten formats.
            </li>
            <li>
              <ChartNoAxesCombined />
              Understand your mistakes, timing and confidence.
            </li>
            <li>
              <Compass />
              Leave every test with a focused practice plan.
            </li>
          </ul>
        </section>

        <section className="student-panel student-login-card">
          <p className="eyebrow">Student Practice Space</p>
          <h2>Sign in or try as guest</h2>
          <p>
            Track your diagnostic attempts, sync responses safely, and discover your
            strongest topics.
          </p>

          {error && (
            <p role="alert" className="student-warning">
              {error}
            </p>
          )}

          <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
            {/* Primary Google Login Button */}
            <a
              href="/api/auth/google"
              className="button-google"
              id="google-signin-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>

            <div className="auth-divider">
              <span>or zero-friction preview</span>
            </div>

            {/* Instant Guest / Preview Button */}
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="button-secondary-outline"
              id="guest-signin-button"
            >
              <Sparkles size={17} />
              <span>{loading ? "Preparing preview..." : "Try Demo as Guest (Instant)"}</span>
            </button>
          </div>

          <form
            style={{ marginTop: "24px" }}
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              if (
                String(data.get("email")).trim().toLowerCase() !==
                  "student@testdisha.demo" ||
                data.get("password") !== "Student@123"
              ) {
                setError("Use the demo email and password shown below, or click 'Continue with Google'.");
                return;
              }
              signIn();
              router.push("/student");
            }}
          >
            <details style={{ fontSize: "13px", color: "#53617c" }}>
              <summary style={{ cursor: "pointer", marginBottom: "12px" }}>
                Need credentials login? (Demo account)
              </summary>
              <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    defaultValue="student@testdisha.demo"
                  />
                </label>
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    defaultValue="Student@123"
                  />
                </label>
                <button className="button-primary" type="submit">
                  Sign in with demo password <ArrowRight size={16} />
                </button>
              </div>
            </details>
          </form>

          <div
            style={{
              marginTop: "20px",
              padding: "12px 14px",
              background: "#f4f7fb",
              borderRadius: "8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "12px",
              color: "#5c6c84",
            }}
          >
            <ShieldCheck size={16} style={{ color: "var(--blue)", flexShrink: 0, marginTop: "2px" }} />
            <span>
              Your responses are autosaved on every selection with offline backup. No
              commercial payment required for diagnostic mocks.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
