"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { isNotesInterest } from "@/data/notes";

type Props = { interest: string; label: string; source: string };

/** Notify-me form for notes. Posts to /api/waitlist with a notes interest; same consent wording as the waitlist form. */
export function NotesNotifyForm({ interest, label, source }: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isNotesInterest(interest)) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), exam: interest, source }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.message || "You're on the list. We'll email you when the notes open.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "We could not save that just now. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <p className="nt-done" role="status">
        {message}
      </p>
    );
  }

  return (
    <form className="nt-form" onSubmit={submit}>
      <label htmlFor={`${id}-email`}>Your email</label>
      <input
        id={`${id}-email`}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={200}
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-describedby={`${id}-note`}
      />
      <p id={`${id}-note`} className="nt-consent">
        We use this email only to tell you when {label} opens, and delete it on request. Under 18? Ask a parent first.{" "}
        <Link href="/privacy#waitlist-data">Privacy Policy</Link>
      </p>
      {status === "error" && (
        <p className="nt-error" role="alert">
          {message}
        </p>
      )}
      <button type="submit" className="button-primary" disabled={status === "loading"}>
        {status === "loading" ? "Saving…" : "Notify me"}
      </button>
    </form>
  );
}
