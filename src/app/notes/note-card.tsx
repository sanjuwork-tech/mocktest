import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { coverage, type Note } from "@/data/notes";
import "./notes.css";

/** One subject's notes: exam, subject, what it covers, price and the honest status. */
export function NoteCard({ note, index }: { note: Note; index?: number }) {
  return (
    <article className="nt-card" data-exam={note.exam} style={index === undefined ? undefined : ({ "--i": index } as React.CSSProperties)}>
      <p className="nt-card-exam">{note.examName}</p>
      <h3>
        <Link href={note.path} className="nt-card-link">
          {note.subjectName} notes
        </Link>
      </h3>
      <p className="nt-card-meta">{coverage(note)} covered</p>
      <div className="nt-card-foot">
        <p className="nt-price">
          ₹{note.price}
          <span className="nt-soon">Opens soon</span>
        </p>
        <span className="nt-card-cta" aria-hidden="true">
          Notify me <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
}
