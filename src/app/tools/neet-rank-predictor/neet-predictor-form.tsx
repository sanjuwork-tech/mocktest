"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { CANDIDATE_CATEGORIES, CATEGORY_LABELS } from "@/lib/predictors/neet";
import "./neet-predictor.css";
import { submitToolInputs, type ToolSubmission } from "@/lib/predictors/submissions";

type Mode = "rank" | "college";
type Initial = { marks?: string; air?: string; category?: string; pwd?: boolean; course?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Small GET form: the server page reads the query string and renders the result, so it also works without
 * JavaScript. With JavaScript we first record the inputs (no name) via the submissions API.
 */
export function NeetPredictorForm({ mode, initial = {} }: { mode: Mode; initial?: Initial }) {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState<"" | "adult" | "guardian">("");
  const [saved, setSaved] = useState("");
  const action = mode === "rank" ? "/tools/neet-rank-predictor" : "/tools/neet-college-predictor";
  const tool = mode === "rank" ? "neet-rank-predictor" : "neet-college-predictor";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const inputs: Record<string, string | boolean> = {};
    const query = new URLSearchParams();
    if (mode === "rank") {
      const marks = String(data.get("marks") ?? "").trim();
      if (!/^-?\d{1,3}$/.test(marks) || Number(marks) < -180 || Number(marks) > 720) {
        setError("Enter your marks as a whole number between −180 and 720.");
        return;
      }
      inputs.marks = marks;
      query.set("marks", marks);
    } else {
      const air = String(data.get("air") ?? "").replace(/[,\s]/g, "");
      if (!/^\d{1,7}$/.test(air) || Number(air) < 1) {
        setError("Enter your All India Rank as a whole number, for example 25000.");
        return;
      }
      const category = String(data.get("category") ?? "");
      const course = String(data.get("course") ?? "any");
      const pwd = data.get("pwd") === "1";
      Object.assign(inputs, { air, category, course, pwd });
      query.set("air", air);
      query.set("category", category);
      if (course !== "any") query.set("course", course);
      if (pwd) query.set("pwd", "1");
    }
    const trimmed = email.trim();
    if (trimmed && !EMAIL.test(trimmed)) {
      setError("That email address does not look right. Leave it empty if you only want the estimate.");
      return;
    }
    if (trimmed && !consent) {
      setError("To save your email, choose who is agreeing: you (18 or older) or your parent or guardian.");
      return;
    }
    setError("");
    setBusy(true);
    const payload: ToolSubmission = { tool, inputs };
    if (trimmed && consent) {
      payload.email = trimmed.toLowerCase();
      payload.consentBasis = consent;
    }
    // Recording inputs never blocks the estimate; the helper does not throw.
    const result = await submitToolInputs(payload, { keepalive: true });
    setSaved(result.ok && payload.email ? "Saved for NEET updates. You can ask us to delete it at any time." : "");
    setBusy(false);
    router.push(`${action}?${query.toString()}#result`, { scroll: false });
    document.getElementById("result")?.focus();
  }

  return (
    <form className="neetp-form" action={action} method="get" onSubmit={onSubmit} noValidate>
      {mode === "rank" ? (
        <label className="neetp-field">
          <span>Your NEET UG marks (out of 720)</span>
          <input
            name="marks"
            type="number"
            inputMode="numeric"
            min={-180}
            max={720}
            step={1}
            required
            defaultValue={initial.marks}
            placeholder="e.g. 620"
            aria-describedby={`${id}-hint`}
          />
          <small id={`${id}-hint`}>From a mock, the answer key or your scorecard. Marking is +4 / −1.</small>
        </label>
      ) : (
        <>
          <label className="neetp-field">
            <span>Your NEET UG All India Rank (AIR)</span>
            <input
              name="air"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              required
              defaultValue={initial.air}
              placeholder="e.g. 25000"
              aria-describedby={`${id}-hint`}
            />
            <small id={`${id}-hint`}>
              Only know your marks? <Link href="/tools/neet-rank-predictor">Estimate your rank first</Link>.
            </small>
          </label>
          <label className="neetp-field">
            <span>Your category</span>
            <select name="category" defaultValue={initial.category ?? "GN"}>
              {CANDIDATE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="neetp-field">
            <span>Course</span>
            <select name="course" defaultValue={initial.course ?? "any"}>
              <option value="any">MBBS and BDS</option>
              <option value="MBBS">MBBS only</option>
              <option value="BDS">BDS only</option>
            </select>
          </label>
          <label className="neetp-check">
            <input type="checkbox" name="pwd" value="1" defaultChecked={initial.pwd} />
            <span>I am a person with benchmark disability (PwBD)</span>
          </label>
        </>
      )}

      <details className="neetp-email">
        <summary>Save my email for NEET updates (optional)</summary>
        <label className="neetp-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <fieldset className="neetp-consent">
          <legend>Who agrees to us keeping this email?</legend>
          <label className="neetp-check">
            <input type="radio" name="consent" form={`${id}-detached`} checked={consent === "adult"} onChange={() => setConsent("adult")} />
            <span>I am 18 or older</span>
          </label>
          <label className="neetp-check">
            <input
              type="radio"
              name="consent"
              form={`${id}-detached`}
              checked={consent === "guardian"}
              onChange={() => setConsent("guardian")}
            />
            <span>My parent or guardian agrees</span>
          </label>
        </fieldset>
        <p className="neetp-small">
          We only use it for NEET and OurMocks updates and delete it on request. <Link href="/privacy">Privacy policy</Link>
        </p>
      </details>

      {error && (
        <p className="neetp-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button-primary neetp-submit" disabled={busy}>
        {busy ? "Working…" : mode === "rank" ? "Estimate my rank" : "Show colleges"}
      </button>
      <p className="neetp-small">We keep your inputs, without your name, to improve these tools.</p>
      {saved && (
        <p className="neetp-small" role="status">
          {saved}
        </p>
      )}
    </form>
  );
}
