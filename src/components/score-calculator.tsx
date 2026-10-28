"use client";

import { useMemo, useState } from "react";
import { EXAMS, EXAM_SLUGS, SUBJECT_NAMES, type ExamSlug, type SubjectId } from "@/lib/exams/catalog";
import { calculateScore, sectionsFor } from "@/lib/score-calculator";

type Counts = Record<string, { correct: string; wrong: string }>;

export function ScoreCalculator({ initialExam }: { initialExam?: string }) {
  const [exam, setExam] = useState<ExamSlug>(
    (EXAM_SLUGS as readonly string[]).includes(initialExam ?? "") ? (initialExam as ExamSlug) : "cuet-ug",
  );
  const [cuetSubjects, setCuetSubjects] = useState<SubjectId[]>(["english", "general-test", "physics"]);
  const [counts, setCounts] = useState<Counts>({});

  const sections = useMemo(() => sectionsFor(exam, cuetSubjects), [exam, cuetSubjects]);
  const key = (name: string) => `${exam}:${name}`;
  const result = calculateScore(
    exam,
    sections.map((s) => ({
      ...s,
      correct: Number(counts[key(s.name)]?.correct || 0),
      wrong: Number(counts[key(s.name)]?.wrong || 0),
    })),
  );

  const update = (name: string, field: "correct" | "wrong", value: string) =>
    setCounts((c) => ({ ...c, [key(name)]: { ...(c[key(name)] ?? { correct: "", wrong: "" }), [field]: value } }));

  const toggleSubject = (id: SubjectId) =>
    setCuetSubjects((list) =>
      list.includes(id) ? list.filter((s) => s !== id) : list.length < 5 ? [...list, id] : list,
    );

  const marking = [...new Set(sections.map((s) => (s.penalty ? `+${s.marks} / −${s.penalty}` : `+${s.marks}, no negative marking`)))].join(", ");

  return (
    <div className="calc">
      <div className="calc-tabs" role="tablist" aria-label="Exam">
        {EXAM_SLUGS.map((slug) => (
          <button key={slug} role="tab" aria-selected={exam === slug} onClick={() => setExam(slug)}>
            {EXAMS[slug].shortName}
          </button>
        ))}
      </div>

      {exam === "cuet-ug" && (
        <fieldset className="calc-subjects">
          <legend>Your papers (up to 5)</legend>
          {EXAMS["cuet-ug"].subjects.map((id) => (
            <label key={id} className={cuetSubjects.includes(id) ? "selected" : ""}>
              <input
                type="checkbox"
                checked={cuetSubjects.includes(id)}
                disabled={!cuetSubjects.includes(id) && cuetSubjects.length >= 5}
                onChange={() => toggleSubject(id)}
              />
              {SUBJECT_NAMES[id]}
            </label>
          ))}
        </fieldset>
      )}

      <p className="calc-marking">
        Official marking: <strong>{marking}</strong>
        {result.bestSections ? ` · only your best ${result.bestSections} sections count` : ""}
      </p>

      <div className="calc-grid">
        <div className="calc-inputs">
          {result.sections.map((s) => (
            <fieldset key={s.name} className={`calc-section${s.counted ? "" : " not-counted"}`}>
              <legend>
                {s.name} <small>({s.questions} questions)</small>
              </legend>
              <label>
                Correct
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={s.questions}
                  value={counts[key(s.name)]?.correct ?? ""}
                  onChange={(e) => update(s.name, "correct", e.target.value)}
                />
              </label>
              <label>
                Wrong
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={s.questions}
                  value={counts[key(s.name)]?.wrong ?? ""}
                  onChange={(e) => update(s.name, "wrong", e.target.value)}
                />
              </label>
              <output aria-live="polite">
                {s.error ? <span className="calc-error">{s.error}</span> : <>{s.score} / {s.max}</>}
                {!s.counted && <small> · not counted</small>}
              </output>
            </fieldset>
          ))}
        </div>

        <aside className="calc-result" aria-live="polite">
          <p className="eyebrow">Your score</p>
          <p className="calc-total">
            {result.hasError ? "—" : result.total}
            <span> / {result.max}</span>
          </p>
          <dl>
            <div>
              <dt>Accuracy on attempted</dt>
              <dd>{result.accuracy}%</dd>
            </div>
            <div>
              <dt>Marks lost to wrong answers</dt>
              <dd>{result.lostToNegatives}</dd>
            </div>
          </dl>
          {exam === "cuet-ug" && (
            <p className="calc-note">
              This is your raw score per paper. NTA normalises papers held in several shifts, so your final NTA score can differ.
            </p>
          )}
          {exam === "niser-nest" && (
            <p className="calc-note">
              Each counted section must also clear its minimum admissible score (20% of the top-100 average), which depends on
              everyone&apos;s results and can&apos;t be calculated in advance.
            </p>
          )}
          {exam === "comedk" && <p className="calc-note">COMEDK ranks candidates on this score; there is no negative marking.</p>}
        </aside>
      </div>
    </div>
  );
}
