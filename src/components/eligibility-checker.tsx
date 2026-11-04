"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import { checkEligibility, type EligibilityInput, type Subject } from "@/lib/eligibility";
import { EXAMS, EXAM_SLUGS } from "@/lib/exams/catalog";

const SUBJECTS: { id: Subject; label: string }[] = [
  { id: "physics", label: "Physics" },
  { id: "chemistry", label: "Chemistry" },
  { id: "mathematics", label: "Mathematics" },
  { id: "biology", label: "Biology" },
  { id: "computer-science", label: "Computer Science" },
  { id: "english", label: "English" },
];

const STATUS = {
  eligible: { label: "Eligible", Icon: CheckCircle2 },
  "not-eligible": { label: "Not eligible", Icon: XCircle },
  check: { label: "Check your marks", Icon: CircleHelp },
} as const;

/** Answers are checked in the browser against src/lib/eligibility.ts; nothing is sent anywhere. */
export function EligibilityChecker() {
  const [input, setInput] = useState<EligibilityInput>({
    passYear: "2027",
    subjects: ["english"],
    percent: null,
    reserved: false,
    karnatakaReserved: false,
  });
  const result = checkEligibility(input);
  const set = (change: Partial<EligibilityInput>) => setInput((current) => ({ ...current, ...change }));
  const toggle = (subject: Subject) =>
    set({ subjects: input.subjects.includes(subject) ? input.subjects.filter((s) => s !== subject) : [...input.subjects, subject] });

  return (
    <section className="elig-checker" aria-labelledby="elig-checker-title">
      <h2 id="elig-checker-title">Check which exams you can take</h2>
      <p className="elig-note">
        Based on the official 2026 rules. The 2027 bulletins aren&apos;t out yet, so passing-year windows are moved forward
        one year; confirm in each bulletin before you apply.
      </p>
      <div className="elig-form">
        <label>
          When do you pass Class 12?
          <select value={input.passYear} onChange={(e) => set({ passYear: e.target.value as EligibilityInput["passYear"] })}>
            <option value="2027">Appearing in 2027</option>
            <option value="2026">Passed in 2026</option>
            <option value="2025">Passed in 2025</option>
            <option value="earlier">2024 or earlier</option>
          </select>
        </label>
        <label>
          Class 12 percentage (expected, if appearing)
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.1"
            value={input.percent ?? ""}
            placeholder="e.g. 72"
            onChange={(e) => set({ percent: e.target.value === "" ? null : Math.min(100, Math.max(0, Number(e.target.value))) })}
          />
        </label>
        <fieldset>
          <legend>Your Class 12 subjects</legend>
          {SUBJECTS.map((s) => (
            <label key={s.id} className="elig-check">
              <input type="checkbox" checked={input.subjects.includes(s.id)} onChange={() => toggle(s.id)} /> {s.label}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Category</legend>
          <label className="elig-check">
            <input type="checkbox" checked={input.reserved} onChange={(e) => set({ reserved: e.target.checked })} /> SC, ST or PwD
          </label>
          <label className="elig-check">
            <input
              type="checkbox"
              checked={input.karnatakaReserved}
              onChange={(e) => set({ karnatakaReserved: e.target.checked })}
            />{" "}
            Karnataka SC, ST or OBC
          </label>
        </fieldset>
      </div>

      <ul className="elig-results" aria-live="polite">
        {EXAM_SLUGS.map((slug) => {
          const verdict = result[slug];
          const { label, Icon } = STATUS[verdict.status];
          return (
            <li key={slug} className={`elig-result is-${verdict.status}`}>
              <div className="elig-result-head">
                <strong>{EXAMS[slug].name}</strong>
                <span>
                  <Icon size={16} aria-hidden="true" /> {label}
                </span>
              </div>
              <ul>
                {verdict.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {verdict.status !== "not-eligible" && (
                <p className="elig-links">
                  <Link className="text-link" href={`/free-diagnostic?exam=${slug}`}>
                    Free Test 1
                  </Link>
                  <Link className="text-link" href={`/exams/${slug}`}>
                    Exam guide
                  </Link>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
