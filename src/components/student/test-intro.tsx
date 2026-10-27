"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { blueprintFor } from "@/lib/blueprints/definitions";
import { EXAMS, SUBJECT_NAMES, isExamSlug, isSubjectId } from "@/lib/exams/catalog";
import { api, newIdempotencyKey, type Catalog, type CatalogTest } from "./api";
import { StudentShell } from "./shell";

/** /student/start?exam=&subject=&test= — resolves a catalog position (used by marketing links) to its test. */
export function StartResolver() {
  return (
    <StudentShell>
      <Resolve />
    </StudentShell>
  );
}

function Resolve() {
  const router = useRouter();
  const params = useSearchParams();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const exam = params.get("exam") ?? "";
    const subject = params.get("subject");
    const number = Number(params.get("test") ?? "1");
    api<Catalog>("/api/student/catalog").then((catalog) => {
      const test = catalog.tests.find(
        (t) => t.exam === exam && (t.subject ?? null) === (subject || null) && t.testNumber === number,
      );
      if (test) router.replace(`/student/tests/${test.testId}`);
      else setMissing(true);
    }, () => setMissing(true));
  }, [params, router]);

  if (!missing) return <p role="status">Finding your test…</p>;
  return (
    <p className="student-empty">
      That test isn&apos;t available yet. <Link href="/student">See the tests you can take now</Link>.
    </p>
  );
}

export function TestIntro({ testId }: { testId: string }) {
  return (
    <StudentShell>
      <Intro testId={testId} />
    </StudentShell>
  );
}

function Intro({ testId }: { testId: string }) {
  const router = useRouter();
  const [test, setTest] = useState<CatalogTest | null | undefined>(undefined);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useMemo(() => newIdempotencyKey(), []);

  useEffect(() => {
    api<Catalog>("/api/student/catalog").then(
      (c) => setTest(c.tests.find((t) => t.testId === testId) ?? null),
      (e: Error) => setError(e.message),
    );
  }, [testId]);

  const blueprint = useMemo(() => {
    if (!test || !isExamSlug(test.exam)) return undefined;
    return blueprintFor(test.exam, test.subject && isSubjectId(test.subject) ? test.subject : null);
  }, [test]);

  if (error)
    return (
      <p className="student-warning" role="alert">
        {error}
      </p>
    );
  if (test === undefined) return <p role="status">Loading test…</p>;
  if (test === null || !blueprint)
    return (
      <p className="student-empty">
        This test isn&apos;t available. <Link href="/student">Back to your tests</Link>.
      </p>
    );

  const exam = EXAMS[blueprint.examSlug];
  const resume = test.latestAttempt?.status === "in_progress" ? test.latestAttempt.attemptId : null;
  const sections = blueprint.sections;
  const marking = [...new Set(sections.map((s) => `+${s.marksPerQuestion} / −${s.penaltyPerQuestion}`))].join(", ");

  const start = async () => {
    setStarting(true);
    setError("");
    try {
      const { attemptId } = await api<{ attemptId: string }>("/api/attempts", {
        method: "POST",
        json: { testId, idempotencyKey },
      });
      router.push(`/student/exam/${attemptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the test.");
      setStarting(false);
    }
  };

  return (
    <section className="student-panel test-intro">
      <p className="eyebrow">
        {exam.name}
        {test.subject && isSubjectId(test.subject) ? ` · ${SUBJECT_NAMES[test.subject]}` : ""} · Test {test.testNumber}
      </p>
      <h1>{test.title}</h1>
      <div className="student-card-facts">
        <span>{blueprint.totalQuestions} questions</span>
        <span>{blueprint.durationMinutes} minutes</span>
        <span>{blueprint.totalMarks} marks</span>
        {test.access === "free" && <span className="badge-free">Free test</span>}
      </div>

      <h2>Instructions</h2>
      <ul>
        <li>
          Marking follows the official {exam.shortName} scheme: {marking.replace(/ \/ −0/g, " (no negative marking)")} for
          a correct / incorrect answer, and 0 for an unanswered question.
        </li>
        {sections.length > 1 && (
          <li>
            The paper has {sections.length} sections ({sections.map((s) => `${s.name} ${s.questionCount}`).join(", ")}). You
            can move between sections freely.
          </li>
        )}
        {blueprint.scoringPolicy.bestSections && (
          <li>
            Only your best {blueprint.scoringPolicy.bestSections} section scores count towards the total, as in the
            official exam.
          </li>
        )}
        <li>
          Each question has one correct answer. Use <strong>Save &amp; Next</strong> to move on,{" "}
          <strong>Mark for Review &amp; Next</strong> to come back later, and <strong>Clear Response</strong> to remove an
          answer. Answers marked for review are still scored.
        </li>
        <li>
          The timer runs on our server. Answers save automatically; if your connection drops, your saved answers and
          remaining time are kept — reopen the test to continue.
        </li>
        <li>The test submits automatically when time runs out.</li>
      </ul>

      {test.access === "locked" ? (
        <p className="student-warning">
          <Lock size={16} aria-hidden="true" /> This test is part of the {exam.shortName} series.{" "}
          <Link href={`/test-series/${blueprint.examSlug}`}>See the series</Link>
        </p>
      ) : resume ? (
        <Link className="button-primary" href={`/student/exam/${resume}`}>
          Resume test <ArrowRight size={18} />
        </Link>
      ) : (
        <>
          <label className="intro-agree">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />I have read and
            understood the instructions.
          </label>
          {error && (
            <p className="student-warning" role="alert">
              {error}
            </p>
          )}
          <button className="button-primary" onClick={start} disabled={!agreed || starting}>
            {starting ? <Loader2 className="animate-spin" size={18} /> : null}
            {starting ? "Preparing your test…" : "Start test"} {!starting && <ArrowRight size={18} />}
          </button>
        </>
      )}
    </section>
  );
}
