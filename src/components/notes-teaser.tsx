import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NoteCard } from "@/app/notes/note-card";
import { NOTES_PRICE, featuredNotes } from "@/data/notes";
import "./notes-teaser.css";

/** Landing page section: a few featured subject notes and a link to all of them. */
export function NotesTeaser() {
  return (
    <section className="nts page-shell" aria-labelledby="nts-title">
      <div className="nts-head">
        <div>
          <h2 id="nts-title">Resources</h2>
          <p>Subject notes for every exam we cover — ₹{NOTES_PRICE} each.</p>
        </div>
        <Link href="/notes" className="text-link">
          View all notes <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ul className="nt-grid">
        {featuredNotes().map((note, i) => (
          <li key={note.slug}>
            <NoteCard note={note} index={i} />
          </li>
        ))}
      </ul>
      <p className="nts-foot">Notes open soon. Payments are not live yet, so you can ask to be notified.</p>
    </section>
  );
}
