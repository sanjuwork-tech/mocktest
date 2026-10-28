"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, Loader2, ShieldCheck } from "lucide-react";
import { api } from "./api";

const GOOGLE_ERRORS: Record<string, string> = {
  invalid_state: "That sign-in link expired. Please try again.",
  no_code: "Google sign-in was cancelled. Please try again.",
  google_unavailable: "Google sign-in is not available yet. Please use your email instead.",
  google_failed: "Google sign-in failed. Please use your email instead.",
};

// Only same-site paths are allowed as a post-login destination.
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/student";
}

export function StudentAuthForm({ guestEnabled = false }: { guestEnabled?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"register" | "login">(params.get("mode") === "login" ? "login" : "register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const errorCode = params.get("error");
  const [error, setError] = useState(errorCode ? (GOOGLE_ERRORS[errorCode] ?? GOOGLE_ERRORS.google_failed) : "");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        json: mode === "register" ? { name, email, password } : { email, password },
      });
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const continueAsGuest = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/guest", { method: "POST" });
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start a guest session.");
      setBusy(false);
    }
  };

  const registering = mode === "register";

  return (
    <main id="main-content" className="page-shell student-main">
      <div className="student-login-grid">
        <section>
          <p className="eyebrow">OurMocks practice space</p>
          <h1>
            Practise like the real exam.
            <br />
            <em>Learn from every answer.</em>
          </h1>
          <ul className="student-benefits">
            <li>
              <BookOpenCheck size={20} aria-hidden="true" /> Test 1 of every subject is free — full length, official
              pattern and marking.
            </li>
            <li>
              <ChartNoAxesCombined size={20} aria-hidden="true" /> Section and topic analysis with worked solutions after
              every test.
            </li>
            <li>
              <ShieldCheck size={20} aria-hidden="true" /> Your answers save as you go, so a dropped connection never
              costs you a test.
            </li>
          </ul>
        </section>

        <section className="student-panel student-login-card" aria-labelledby="auth-title">
          <div className="auth-tabs" role="tablist" aria-label="Account">
            <button role="tab" aria-selected={registering} onClick={() => setMode("register")} type="button">
              Create account
            </button>
            <button role="tab" aria-selected={!registering} onClick={() => setMode("login")} type="button">
              Sign in
            </button>
          </div>
          <h2 id="auth-title">{registering ? "Create your free account" : "Welcome back"}</h2>
          <form onSubmit={submit} className="auth-form">
            {registering && (
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} maxLength={100} />
              </label>
            )}
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={200} />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={registering ? "new-password" : "current-password"}
                required
                minLength={registering ? 8 : 1}
                maxLength={128}
              />
              {registering && <small>At least 8 characters.</small>}
            </label>
            {error && (
              <p className="student-warning" role="alert">
                {error}
              </p>
            )}
            <button className="button-primary" type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={18} /> : null}
              {registering ? "Create account & continue" : "Sign in"} {!busy && <ArrowRight size={18} />}
            </button>
          </form>
          {guestEnabled && (
            <div className="guest-option">
              <span>or</span>
              <button type="button" className="student-secondary" onClick={continueAsGuest} disabled={busy}>
                Continue as guest
              </button>
              <small>Try the tests without an account. Guest progress can&apos;t be recovered after you sign out.</small>
            </div>
          )}
          <p className="student-muted">
            By continuing you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
            Students under 18 need a parent or guardian&apos;s consent.
          </p>
        </section>
      </div>
    </main>
  );
}
