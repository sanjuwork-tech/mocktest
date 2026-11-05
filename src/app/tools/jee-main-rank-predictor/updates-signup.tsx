"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { submitToolInputs, type SubmissionValue } from "@/lib/predictors/submissions";

/** Optional email capture with a required consent basis. No email is sent automatically yet. */
export function UpdatesSignup({ tool, inputs }: { tool: string; inputs: Record<string, SubmissionValue> }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setStatus("saving");
    const result = await submitToolInputs({
      tool,
      inputs,
      email: String(data.get("email") ?? "").trim(),
      consentBasis: data.get("consent") === "guardian" ? "guardian" : "adult",
    });
    if (result.ok) {
      setStatus("saved");
      setMessage("Saved. Thank you — you can ask us to delete it at any time.");
      form.reset();
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  return (
    <form className="jeep-signup" onSubmit={onSubmit} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>Save my email for JEE Main updates</h3>
      <p className="jeep-small">Optional. OurMocks is independent; we will not share your email.</p>
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} />
      <fieldset>
        <legend>Consent (required)</legend>
        <label>
          <input type="radio" name="consent" value="adult" required /> I am 18 or older
        </label>
        <label>
          <input type="radio" name="consent" value="guardian" /> My parent or guardian agrees
        </label>
      </fieldset>
      <p className="jeep-small">
        Read how we store and delete it in our <Link href="/privacy">privacy policy</Link>.
      </p>
      <button type="submit" className="button-secondary" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Save my email"}
      </button>
      <p className="jeep-small" role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
