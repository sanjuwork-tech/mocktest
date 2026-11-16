"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NoteCard } from "./note-card";
import { NOTES_EXAM_NAMES, isNotesExam, notes } from "@/data/notes";
import { EXAM_SLUGS } from "@/lib/exams/catalog";

/** Exam filter (URL-addressable with ?exam=) and the grid of note cards. The server HTML lists every card. */
export function NotesBrowser() {
  const raw = useSearchParams().get("exam") ?? "";
  const active = isNotesExam(raw) ? raw : null;
  const shown = active ? notes.filter((n) => n.exam === active) : notes;
  const tabs: { key: string | null; label: string; href: string }[] = [
    { key: null, label: "All exams", href: "/notes" },
    ...EXAM_SLUGS.map((e) => ({ key: e, label: NOTES_EXAM_NAMES[e], href: `/notes?exam=${e}` })),
  ];

  return (
    <>
      <nav className="nt-tabs" aria-label="Filter notes by exam">
        {tabs.map((t) => (
          <Link key={t.label} href={t.href} scroll={false} aria-current={t.key === active ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <p className="nt-count" role="status">
        {shown.length} {shown.length === 1 ? "subject" : "subjects"}
        {active ? ` for ${NOTES_EXAM_NAMES[active]}` : " across four exams"}, ₹149 each
      </p>
      <ul className="nt-grid">
        {shown.map((n) => (
          <li key={n.slug}>
            <NoteCard note={n} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** Suspense fallback and no-JS view: all cards, no filter state. */
export function NotesBrowserStatic() {
  return (
    <ul className="nt-grid">
      {notes.map((n) => (
        <li key={n.slug}>
          <NoteCard note={n} />
        </li>
      ))}
    </ul>
  );
}
