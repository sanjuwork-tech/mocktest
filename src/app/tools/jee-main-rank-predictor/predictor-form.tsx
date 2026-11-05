"use client";

import { useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { submitToolInputs, type SubmissionValue } from "@/lib/predictors/submissions";

/**
 * A GET form that also records the inputs (no name, no IP) before showing results.
 * Without JavaScript it still works as a plain GET form; it just isn't recorded.
 */
export function PredictorForm({
  tool,
  action,
  recordKeys,
  submitLabel,
  children,
}: {
  tool: string;
  action: string;
  /** Field names to record; numeric-looking values are stored as numbers. */
  recordKeys: string[];
  submitLabel: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const params = new URLSearchParams();
    const inputs: Record<string, SubmissionValue> = {};
    for (const [key, raw] of new FormData(form)) {
      const value = typeof raw === "string" ? raw.trim() : "";
      if (!value) continue;
      params.set(key, value);
      if (recordKeys.includes(key)) inputs[key] = /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value.slice(0, 120);
    }
    void submitToolInputs({ tool, inputs }, { keepalive: true });
    startTransition(() => router.push(`${action}?${params.toString()}#results`));
  }

  return (
    <form className="jeep-form" method="get" action={action} onSubmit={onSubmit}>
      {children}
      <button type="submit" className="button-primary" disabled={pending}>
        {pending ? "Working it out…" : submitLabel}
      </button>
      <p className="jeep-small">We keep your inputs, without your name, to improve these tools.</p>
    </form>
  );
}
