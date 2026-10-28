import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { exams, formatReviewDate } from "@/data/exams";
import { previousPapersFor } from "@/data/previous-papers";
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
  const papers = previousPapersFor(slug);
  if (!exam || !papers) notFound();
  return pageMetadata(
    `${exam.name} Previous Year Papers: Official Sources`,
    papers.available
      ? `Official ${exam.name} question papers from ${papers.papers.at(-1)?.year} to ${papers.papers[0]?.year}, linked from the exam's own website, with tips for using them.`
      : `Where to find official ${exam.name} practice material, why unofficial "previous year papers" can mislead, and how to practise on the real pattern.`,
    `/exams/${slug}/previous-year-papers`,
  );
}

export default async function PreviousPapersPage({ params }: Props) {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);
  const papers = previousPapersFor(slug);
  if (!exam || !papers) notFound();

  return (
    <ExamSubpage
      exam={exam}
      path="previous-year-papers"
      name="Previous year papers"
      title={
        <>
          {exam.name} previous
          <br />
          <em>year papers.</em>
        </>
      }
      lede={papers.summary}
      dateModified={papers.checkedOn}
    >
      {papers.available ? (
        <section aria-labelledby="papers-title">
          <h2 id="papers-title" className="sr-only">
            Official question papers
          </h2>
          <ul className="paper-grid">
            {papers.papers.map((p) => (
              <li key={p.year}>
                <strong>{p.year}</strong>
                <span>
                  {p.links.map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label} <ArrowUpRight size={13} aria-hidden="true" />
                      <span className="sr-only"> (PDF on the official website, opens in a new tab)</span>
                    </a>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="syllabus-note">No official archive of past papers is published for {exam.name}.</p>
      )}

      <section className="next-cycle-panel section-space" aria-labelledby="how-title">
        <h2 id="how-title">How to use {papers.available ? "these papers" : "your practice time"}</h2>
        <ul>
          {papers.alternatives.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="source-panel">
        <h2>Official sources</h2>
        <div>
          {papers.sources.map((s) => (
            <OfficialAnchor key={s.url} link={s} className="text-link" />
          ))}
        </div>
        <p className="review-note">
          Checked <time dateTime={papers.checkedOn}>{formatReviewDate(papers.checkedOn)}</time>. All paper links point to
          the exam body&apos;s own website.
        </p>
      </section>

      <section className="exam-cta-band section-space">
        <div>
          <span className="badge-lime">After a paper</span>
          <h2>Work out your score</h2>
          <p>Enter your correct and wrong answers and get your score under the official {exam.name} marking scheme.</p>
        </div>
        <Link href={`/tools/score-calculator?exam=${slug}`} className="button-light">
          Open the score calculator <ArrowRight size={16} />
        </Link>
      </section>
    </ExamSubpage>
  );
}
