import { Suspense } from "react";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/data/catalog";
import { NOTES_FAQS, NOTES_PRICE, hubMeta, notes } from "@/data/notes";
import { NotesBrowser, NotesBrowserStatic } from "./notes-browser";
import { NotesNotifyForm } from "./notify-form";
import { Crumbs, Faqs, NotesJsonLd } from "./parts";
import "./notes.css";

const PATH = "/notes";
const TRAIL = [{ name: "Notes", href: PATH }];
export const metadata = pageMetadata(hubMeta.title, hubMeta.description, PATH);

export default function NotesHubPage() {
  const url = `${siteConfig.url}${PATH}`;
  return (
    <main id="main-content" tabIndex={-1}>
      <NotesJsonLd
        trail={TRAIL}
        faqs={NOTES_FAQS}
        nodes={[
          {
            "@type": "CollectionPage",
            "@id": `${url}#page`,
            name: "Exam notes by subject",
            url,
            isPartOf: { "@id": `${siteConfig.url}/#website` },
            hasPart: notes.map((n) => ({ "@type": "WebPage", name: `${n.examName} ${n.subjectName} notes`, url: `${siteConfig.url}${n.path}` })),
          },
        ]}
      />
      <section className="guide-hero page-shell">
        <Crumbs trail={TRAIL} />
        <p className="eyebrow">Resources</p>
        <h1>
          All your notes
          <br />
          <em>in one place.</em>
        </h1>
        <p className="hero-copy">
          Subject notes prepared by the OurMocks team for CUET UG, IISER IAT, NISER NEST and COMEDK UGET. ₹{NOTES_PRICE} per
          subject, for any exam. Notes are not open for purchase yet, so you can add your email and we will tell you the
          day they are.
        </p>
      </section>

      <div className="page-shell nt-body">
        <Suspense fallback={<NotesBrowserStatic />}>
          <NotesBrowser />
        </Suspense>

        <section className="nt-why" aria-labelledby="nt-why-title">
          <h2 id="nt-why-title">Why ₹{NOTES_PRICE}</h2>
          <p>
            We wanted affordable notes that a student can pay for without asking twice: low-budget, but cheap and still worth
            it. So every subject costs the same, whichever exam it is for, and you only pay for the subjects you sit. We would
            rather keep the price low and the notes concise than pad them out.
          </p>
          <p>Nothing is charged today. Payments are not live yet, and the price is confirmed when the notes open.</p>
        </section>

        <section className="nt-notify" aria-labelledby="nt-notify-title">
          <div>
            <h2 id="nt-notify-title">Tell me when notes open</h2>
            <p>One email when the notes open, nothing else. Pick your exam and subject on its own page to ask for just that one.</p>
          </div>
          <NotesNotifyForm interest="notes-all" label="the notes" source="notes_hub" />
        </section>

        <Faqs title="Questions about the notes" faqs={NOTES_FAQS} />
      </div>
    </main>
  );
}
