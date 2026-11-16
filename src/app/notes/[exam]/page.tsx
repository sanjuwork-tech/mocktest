import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/data/catalog";
import { NOTES_EXAM_NAMES, NOTES_PRICE, examMeta, isNotesExam, notesFor } from "@/data/notes";
import { EXAM_SLUGS } from "@/lib/exams/catalog";
import { NoteCard } from "../note-card";
import { NotesNotifyForm } from "../notify-form";
import { Crumbs, NotesJsonLd } from "../parts";
import "../notes.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return EXAM_SLUGS.map((exam) => ({ exam }));
}
type Props = { params: Promise<{ exam: string }> };

export async function generateMetadata({ params }: Props) {
  const { exam } = await params;
  if (!isNotesExam(exam)) notFound();
  const m = examMeta(exam);
  return pageMetadata(m.title, m.description, `/notes/${exam}`);
}

export default async function ExamNotesPage({ params }: Props) {
  const { exam } = await params;
  if (!isNotesExam(exam)) notFound();
  const name = NOTES_EXAM_NAMES[exam];
  const list = notesFor(exam);
  const url = `${siteConfig.url}/notes/${exam}`;
  const trail = [{ name: "Notes", href: "/notes" }, { name, href: `/notes/${exam}` }];
  return (
    <main id="main-content" tabIndex={-1}>
      <NotesJsonLd
        trail={trail}
        nodes={[
          {
            "@type": "CollectionPage",
            "@id": `${url}#page`,
            name: `${name} notes by subject`,
            url,
            hasPart: list.map((n) => ({ "@type": "WebPage", name: `${name} ${n.subjectName} notes`, url: `${siteConfig.url}${n.path}` })),
          },
        ]}
      />
      <section className="guide-hero page-shell">
        <Crumbs trail={trail} />
        <p className="eyebrow">{name} notes</p>
        <h1>
          {name} notes,
          <br />
          <em>₹{NOTES_PRICE} a subject.</em>
        </h1>
        <p className="hero-copy">
          {list.length} subjects, each written to the official syllabus and priced the same. Notes are not open for purchase
          yet; choose a subject to see what it covers and ask us to tell you when it opens.
        </p>
        <p className="gp-links">
          <Link href={`/exams/${exam}`} className="text-link">
            {name} exam guide
          </Link>
          <Link href={`/free-diagnostic?exam=${exam}`} className="text-link">
            Free Test 1
          </Link>
        </p>
      </section>
      <div className="page-shell nt-body">
        <ul className="nt-grid">
          {list.map((n) => (
            <li key={n.slug}>
              <NoteCard note={n} />
            </li>
          ))}
        </ul>
        <section className="nt-notify" aria-labelledby="nt-notify-title">
          <div>
            <h2 id="nt-notify-title">Want all {name} notes?</h2>
            <p>Add your email and we will write once when the {name} notes open.</p>
          </div>
          <NotesNotifyForm interest={`notes-${exam}`} label={`the ${name} notes`} source={`notes_${exam}`} />
        </section>
      </div>
    </main>
  );
}
