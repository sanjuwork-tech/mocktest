import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { exams, formatReviewDate } from "@/data/exams";
import { syllabusFor } from "@/data/syllabus";
import { pageMetadata } from "@/lib/page-metadata";
import { ExamSubpage } from "@/components/exam-subpage";
import { OfficialAnchor } from "@/components/exam-guide-article";

export const dynamicParams = false;
export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }));
}
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);
  const syllabus = syllabusFor(slug);
  if (!exam || !syllabus) notFound();
  return pageMetadata(
    `${exam.name} Syllabus 2027: Units by Subject`,
    `${exam.name} syllabus, unit by unit, from the official 2026 documents${syllabus.subjects.length ? `, for ${syllabus.subjects.length} subjects` : ""} — with links to every official PDF.`,
    `/exams/${slug}/syllabus`,
  );
}

export default async function SyllabusPage({ params }: Props) {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);
  const syllabus = syllabusFor(slug);
  if (!exam || !syllabus) notFound();

  return (
    <ExamSubpage
      exam={exam}
      path="syllabus"
      name="Syllabus"
      title={
        <>
          {exam.name} syllabus
          <br />
          <em>unit by unit.</em>
        </>
      }
      lede={syllabus.summary}
      dateModified={syllabus.checkedOn}
    >
      <ul className="syllabus-notes">
        {syllabus.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      {syllabus.subjects.length > 1 && (
        <nav className="syllabus-jump" aria-label="Jump to subject">
          {syllabus.subjects.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.name}
            </a>
          ))}
        </nav>
      )}

      <div className="syllabus-subjects">
        {syllabus.subjects.map((subject) => (
          <section key={subject.id} id={subject.id} className="syllabus-subject" aria-labelledby={`${subject.id}-title`}>
            <h2 id={`${subject.id}-title`}>
              {subject.name}
              {subject.code && <small> · code {subject.code}</small>}
            </h2>
            {subject.note && <p className="syllabus-note">{subject.note}</p>}
            <div className="syllabus-groups">
              {subject.groups.map((group) => (
                <div key={group.title}>
                  <h3>{group.title}</h3>
                  <ol>
                    {group.units.map((unit) => (
                      <li key={unit}>{unit}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <OfficialAnchor link={subject.source} className="text-link" />
          </section>
        ))}
      </div>

      <section className="source-panel section-space">
        <h2>Official sources</h2>
        <div>
          {syllabus.sources.map((s) => (
            <OfficialAnchor key={s.url} link={s} className="text-link" />
          ))}
        </div>
        <p className="review-note">
          Transcribed from the official 2026 documents on{" "}
          <time dateTime={syllabus.checkedOn}>{formatReviewDate(syllabus.checkedOn)}</time>. The 2027 syllabus will be
          published with the next bulletin.
        </p>
      </section>

      <section className="exam-cta-band">
        <div>
          <span className="badge-lime">Practice</span>
          <h2>{slug === "cuet-ug" ? "Test yourself on the whole syllabus" : `${exam.name} mocks are in preparation`}</h2>
          <p>
            {slug === "cuet-ug"
              ? "A full CUET paper, free, with a topic-by-topic breakdown of where you lost marks."
              : "Join the waitlist and we'll email you when full-length mocks on the official pattern open."}
          </p>
        </div>
        <Link href={slug === "cuet-ug" ? "/free-diagnostic" : `/free-diagnostic?exam=${slug}#waitlist`} className="button-light">
          {slug === "cuet-ug" ? "Start a free test" : "Join the waitlist"} <ArrowRight size={16} />
        </Link>
      </section>
    </ExamSubpage>
  );
}
