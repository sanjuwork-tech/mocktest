import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/page-metadata";
import { OfficialAnchor } from "@/components/exam-guide-article";
import { siteConfig } from "@/data/catalog";
import { syllabusFor } from "@/data/syllabus";
import { NOTES_CURRENCY, NOTES_PRICE, coverage, noteFor, notes, subjectFaqs, subjectMeta } from "@/data/notes";
import { NotesNotifyForm } from "../../notify-form";
import { Crumbs, Faqs, NotesJsonLd } from "../../parts";
import "../../notes.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return notes.map((n) => ({ exam: n.exam, subject: n.subject }));
}
type Props = { params: Promise<{ exam: string; subject: string }> };

export async function generateMetadata({ params }: Props) {
  const { exam, subject } = await params;
  const note = noteFor(exam, subject);
  if (!note) notFound();
  const m = subjectMeta(note);
  return pageMetadata(m.title, m.description, note.path);
}

export default async function SubjectNotesPage({ params }: Props) {
  const { exam, subject } = await params;
  const note = noteFor(exam, subject);
  if (!note) notFound();
  const url = `${siteConfig.url}${note.path}`;
  const faqs = subjectFaqs(note);
  const source = syllabusFor(note.exam)?.subjects.find((s) => s.id === note.subject)?.source;
  const title = `${note.examName} ${note.subjectName} notes`;
  const trail = [
    { name: "Notes", href: "/notes" },
    { name: note.examName, href: `/notes/${note.exam}` },
    { name: note.subjectName, href: note.path },
  ];

  return (
    <main id="main-content" tabIndex={-1}>
      <NotesJsonLd
        trail={trail}
        faqs={faqs}
        nodes={[
          {
            "@type": "Product",
            "@id": `${url}#product`,
            name: title,
            description: `Concise revision notes for ${note.examName} ${note.subjectName}, written to the official syllabus and prepared by the OurMocks team.`,
            sku: note.slug,
            url,
            brand: { "@type": "Brand", name: siteConfig.name },
            offers: {
              "@type": "Offer",
              url,
              price: String(NOTES_PRICE),
              priceCurrency: NOTES_CURRENCY,
              availability: "https://schema.org/PreOrder",
            },
          },
        ]}
      />
      <section className="guide-hero page-shell">
        <Crumbs trail={trail} />
        <p className="eyebrow">{note.examName} notes</p>
        <h1>
          {note.examName} {note.subjectName} notes,
          <br />
          <em>₹{NOTES_PRICE}.</em>
        </h1>
        <p className="hero-copy">
          Concise revision notes for {note.subjectName}, written to the official {note.examName} syllabus by the OurMocks
          team. Notes are not open for purchase yet. Add your email and we will tell you when they are.
        </p>
      </section>

      <div className="page-shell nt-subject">
        <aside className="nt-aside" aria-labelledby="nt-price-title">
          <p className="nt-card-exam">{note.examName}</p>
          <h2 id="nt-price-title">{note.subjectName} notes</h2>
          <p className="nt-price nt-price-lg">
            ₹{note.price}
            <span className="nt-soon">Opens soon</span>
          </p>
          <p className="nt-aside-note">One subject, one exam. Nothing is charged today, because payments are not live yet.</p>
          <div id="notify">
            <NotesNotifyForm interest={note.interest} label={`the ${title}`} source={`notes_${note.slug}`} />
          </div>
        </aside>

        <div className="nt-main">
          <section aria-labelledby="nt-covered-title">
            <h2 id="nt-covered-title">What the notes cover</h2>
            {note.unitCount ? (
              <>
                <p className="gp-lede">
                  {coverage(note)}, as the exam body prints them. The notes are written around this list.
                </p>
                {note.groups.map((g) => (
                  <div key={g.title} className="nt-units">
                    <h3>{g.title}</h3>
                    <ol>
                      {g.units.map((u) => (
                        <li key={u}>{u}</li>
                      ))}
                    </ol>
                  </div>
                ))}
                {source && <OfficialAnchor link={source} className="text-link" />}
              </>
            ) : (
              <p className="gp-lede">
                {note.examName} does not publish a unit-wise syllabus, so we do not show one as if it were official. The notes
                cover Class 11 and 12 {note.subjectName}, the subject the paper is set from. See the{" "}
                <Link href={`/exams/${note.exam}/syllabus`}>{note.examName} syllabus page</Link> for what the exam body says.
              </p>
            )}
          </section>

          <section aria-labelledby="nt-get-title">
            <h2 id="nt-get-title">What you get</h2>
            <ul className="nt-list">
              <li>Concise revision notes for {note.subjectName}, written to the official syllabus.</li>
              <li>Prepared by the OurMocks team.</li>
              <li>One flat price: ₹{NOTES_PRICE} for this subject.</li>
            </ul>
            <p className="gp-note">Format and delivery details will be confirmed when the notes open.</p>
          </section>

          <section aria-labelledby="nt-next-title">
            <h2 id="nt-next-title">While you wait</h2>
            <p className="gp-lede">
              Test 1 is free for {note.examName}
              {note.exam === "cuet-ug" ? " and live now" : "; it opens when the paper is released"}. It shows you where to
              spend your revision time.
            </p>
            <p className="gp-links">
              <Link href={`/free-diagnostic?exam=${note.exam}`} className="text-link">
                Free {note.examName} Test 1
              </Link>
              <Link href={`/exams/${note.exam}`} className="text-link">
                {note.examName} exam guide
              </Link>
              <Link href={`/notes/${note.exam}`} className="text-link">
                All {note.examName} notes
              </Link>
            </p>
          </section>

          <Faqs title="Questions about these notes" faqs={faqs} />
        </div>
      </div>
    </main>
  );
}
