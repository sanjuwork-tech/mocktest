"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  Target,
  Timer,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { questionsFor } from "@/data/student/bank";
import {
  SUBJECTS,
  TYPE_LABELS,
  analyze,
  answered,
  type Question,
} from "@/lib/student/model";
import { updateAttempt, useDemo } from "@/lib/student/store";
import { StudentShell } from "./shell";
import { QuestionContent, answerText } from "./question";
import { RichText } from "./rich-text";
const pct = (n: number | null) => (n === null ? "—" : `${n}%`);
const time = (n: number) => `${Math.floor(n / 60)}m ${Math.round(n % 60)}s`;
export function StudentResults({ id }: { id: string }) {
  const { attempts } = useDemo();
  const attempt = attempts.find((a) => a.id === id);
  const [view, setView] = useState<"overview" | "review">("overview");
  const [topic, setTopic] = useState("all");
  const [status, setStatus] = useState("all");
  const [format, setFormat] = useState("all");
  if (!attempt)
    return (
      <StudentShell>
        <section className="student-panel student-empty">
          <h1>This report isn’t in this browser.</h1>
          <p>
            Demo results are stored on the device where you took the test.
            Complete a test or open a sample from your dashboard.
          </p>
          <Link href="/student" className="button-primary">
            Go to my practice space
          </Link>
        </section>
      </StudentShell>
    );
  if (!attempt.submittedAt)
    return (
      <StudentShell>
        <section className="student-panel student-empty">
          <h1>Your test is still in progress.</h1>
          <p>Submit your responses to unlock the analysis and explanations.</p>
          <Link
            href={`/student/tests/${attempt.subject}`}
            className="button-primary"
          >
            Resume test
          </Link>
        </section>
      </StudentShell>
    );
  const qs = questionsFor(attempt.subject);
  const result = analyze(qs, attempt);
  const subject = SUBJECTS.find((s) => s.id === attempt.subject)!;
  const previous = attempts
    .filter(
      (a) =>
        !a.sample &&
        a.subject === attempt.subject &&
        a.submittedAt &&
        a.submittedAt < attempt.submittedAt! &&
        a.id !== id,
    )
    .sort((a, b) => b.submittedAt! - a.submittedAt!)[0];
  const delta =
    previous && !attempt.sample
      ? result.score - analyze(qs, previous).score
      : null;
  const confidence = ["high", "medium", "low", "unset"].map((c) => {
    const subset = result.rows.filter(
      (r) => r.attempted && (r.response?.confidence ?? "unset") === c,
    );
    return {
      name: {
        high: "Confident",
        medium: "Somewhat sure",
        low: "Guessing",
        unset: "Not recorded",
      }[c],
      Correct: subset.filter((r) => r.isCorrect).length,
      Incorrect: subset.filter((r) => !r.isCorrect).length,
    };
  });
  const pace = result.rows.map((r) => ({
    question: r.index,
    seconds: Math.round(r.seconds),
    guide: r.q.targetSeconds,
  }));
  const visible = result.rows.filter(
    (r) =>
      (topic === "all" || r.q.topic === topic) &&
      (status === "all" || r.status === status) &&
      (format === "all" || r.q.type === format),
  );
  const review = (t = "all", s = "all") => {
    setTopic(t);
    setStatus(s);
    setView("review");
    requestAnimationFrame(() =>
      document
        .getElementById("analysis-content")
        ?.scrollIntoView({ block: "start" }),
    );
  };
  const exportReport = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            label: attempt.sample ? "Simulated sample" : "Local demo attempt",
            generatedAt: new Date().toISOString(),
            attempt,
            scoring: {
              correct: 4,
              incorrect: -1,
              unanswered: 0,
              partialCredit: false,
            },
            summary: {
              score: result.score,
              max: result.max,
              accuracy: result.accuracy,
              topics: result.topics,
            },
            questions: result.rows.map((r) => ({
              id: r.q.id,
              topic: r.q.topic,
              type: r.q.type,
              status: r.status,
              points: r.points,
              visibleSeconds: r.seconds,
            })),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mockstride-${attempt.subject}-${attempt.id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <StudentShell>
      {attempt.sample && (
        <p className="student-warning">
          <strong>Simulated sample report.</strong> Responses, confidence and
          timing below were generated to demonstrate the interface. They do not
          describe your performance.
        </p>
      )}
      <div className="result-heading">
        <div>
          <p className="eyebrow">{subject.title} · Your learning report</p>
          <h1>
            This is a starting point.
            <br />
            <em>Not your limit.</em>
          </h1>
          <p>
            {attempt.timedOut
              ? "Time ended. Your saved responses were submitted."
              : "Your attempt is complete."}{" "}
            Let’s turn what happened into what comes next.
          </p>
        </div>
        <button onClick={exportReport} className="student-secondary">
          <Download size={17} /> Export report
        </button>
      </div>
      <section className="result-score-banner">
        <div>
          <span>{attempt.sample ? "Sample score" : "Your score"}</span>
          <strong>
            {result.score}
            <small> / {result.max}</small>
          </strong>
          <p>+4 correct · −1 incorrect · no partial credit</p>
        </div>
        <div className="score-outcomes">
          <span>
            <i className="dot-correct" />
            {result.right} correct
          </span>
          <span>
            <i className="dot-wrong" />
            {result.wrong} incorrect
          </span>
          <span>
            <i className="dot-skipped" />
            {result.unanswered} unanswered
          </span>
        </div>
        <div className="score-message">
          <strong>
            {result.accuracy === null
              ? "Your baseline starts with an attempt."
              : result.accuracy >= 80
                ? "There is a strong foundation here."
                : "You now have a clearer place to focus."}
          </strong>
          <p>
            {delta === null
              ? "Review the reasoning, not just the answer. That is where the next improvement begins."
              : `${delta >= 0 ? "+" : ""}${delta} marks compared with your previous completed attempt on this same practice set. Familiarity may influence improvement.`}
          </p>
        </div>
      </section>
      <div className="student-stat-grid result-stats">
        <div>
          <span>Attempted accuracy</span>
          <strong>{pct(result.accuracy)}</strong>
          <small>
            {result.right} correct / {result.right + result.wrong} attempted
          </small>
        </div>
        <div>
          <span>Coverage</span>
          <strong>
            {Math.round(((result.right + result.wrong) / qs.length) * 100)}%
          </strong>
          <small>
            {result.right + result.wrong} of {qs.length} answered
          </small>
        </div>
        <div>
          <span>Visible question time</span>
          <strong>{time(result.activeSeconds)}</strong>
          <small>Estimate; hidden-tab time excluded</small>
        </div>
        <div>
          <span>Elapsed test time</span>
          <strong>
            {time(
              Math.max(0, (attempt.submittedAt - attempt.startedAt) / 1000),
            )}
          </strong>
          <small>Includes time away from the page</small>
        </div>
      </div>
      <div className="analysis-tabs" aria-label="Report sections">
        <button
          aria-pressed={view === "overview"}
          onClick={() => setView("overview")}
        >
          Your analysis
        </button>
        <button
          aria-pressed={view === "review"}
          onClick={() => setView("review")}
        >
          Questions & explanations <span>50</span>
        </button>
      </div>
      <div id="analysis-content">
        {view === "overview" ? (
          <>
            <section className="student-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Start where it matters</p>
                  <h2>Your next practice plan.</h2>
                </div>
                <span className="student-muted">
                  Based on this attempt only
                </span>
              </div>
              <div className="practice-plan-grid">
                {result.topics
                  .filter((t) => t.priority > 0)
                  .slice(0, 3)
                  .map((t, i) => (
                    <article
                      className="student-panel practice-plan"
                      key={t.topic}
                    >
                      <span className="plan-number">0{i + 1}</span>
                      <p className="eyebrow">
                        {t.attempted === 0
                          ? "Build a baseline"
                          : t.wrong > 0
                            ? "Revisit the reasoning"
                            : "Finish the coverage"}
                      </p>
                      <h3>{t.topic}</h3>
                      <p>
                        {t.correct}/{t.attempted} attempted correct ·{" "}
                        {t.unanswered} unanswered.{" "}
                        {t.attempted === 0
                          ? "No attempted evidence yet; this is not a measured weakness."
                          : `Accuracy: ${pct(t.accuracy)} from ${t.attempted} answers.`}
                      </p>
                      <p>
                        <strong>Try this:</strong>{" "}
                        {t.wrong
                          ? "Review one missed explanation, write the rule in your own words, then re-solve it without the answer."
                          : "Review the unanswered questions and work through one solution before retrying."}
                      </p>
                      <button
                        className="student-text-button"
                        onClick={() => review(t.topic)}
                      >
                        Review this topic <ArrowRight size={16} />
                      </button>
                      <small>
                        {t.priority} marks separate these responses from
                        all-correct on this set; not a predicted score gain.
                      </small>
                    </article>
                  ))}
                {result.topics.every((t) => t.priority === 0) && (
                  <article className="student-panel practice-plan">
                    <CheckCircle2 />
                    <h3>A complete, correct attempt.</h3>
                    <p>
                      Review any low-confidence answers, then try an unseen set
                      when available. Repeating familiar questions does not
                      establish mastery.
                    </p>
                    <button
                      className="student-text-button"
                      onClick={() => review()}
                    >
                      Review reasoning <ArrowRight size={16} />
                    </button>
                  </article>
                )}
              </div>
            </section>
            <section className="student-analysis-grid">
              <article className="student-panel chart-panel">
                <p className="eyebrow">Topic map</p>
                <h2>Where your answers landed.</h2>
                <p>
                  Five questions per topic. Select a topic in the table to
                  inspect its evidence.
                </p>
                <div className="analysis-chart topic-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.topics}
                      layout="vertical"
                      margin={{ left: 5, right: 10 }}
                      accessibilityLayer
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                      />
                      <YAxis
                        dataKey="topic"
                        type="category"
                        width={135}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        name="Correct"
                        dataKey="correct"
                        stackId="a"
                        fill="#406900"
                        isAnimationActive={false}
                      />
                      <Bar
                        name="Incorrect"
                        dataKey="wrong"
                        stackId="a"
                        fill="#c94b2e"
                        isAnimationActive={false}
                      />
                      <Bar
                        name="Unanswered"
                        dataKey="unanswered"
                        stackId="a"
                        fill="#cbd3e2"
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <details>
                  <summary>Topic scores and accuracy table</summary>
                  <div className="student-table-scroll">
                    <table>
                      <caption>
                        Accuracy uses attempted questions only. Small samples
                        are directional.
                      </caption>
                      <thead>
                        <tr>
                          <th>Topic</th>
                          <th>Correct / attempted</th>
                          <th>Accuracy</th>
                          <th>Unanswered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.topics.map((t) => (
                          <tr key={t.topic}>
                            <th>
                              <button
                                className="student-text-button"
                                onClick={() => review(t.topic)}
                              >
                                {t.topic}
                              </button>
                            </th>
                            <td>
                              {t.correct}/{t.attempted}
                            </td>
                            <td>{pct(t.accuracy)}</td>
                            <td>{t.unanswered}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </article>
              <article className="student-panel chart-panel">
                <p className="eyebrow">Confidence check</p>
                <h2>Knowing it. Feeling sure.</h2>
                <p>
                  Your optional confidence choices help you find answers worth
                  revisiting.
                </p>
                <div className="analysis-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={confidence} accessibilityLayer>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="Correct"
                        fill="#406900"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="Incorrect"
                        fill="#c94b2e"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="insight-note">
                  <strong>
                    {result.overconfident.length} confident-but-incorrect
                    answers.
                  </strong>{" "}
                  Recheck the underlying reasoning; confidence alone cannot tell
                  us why an error happened.
                </p>
                <p className="insight-note">
                  <strong>
                    {result.uncertainCorrect.length} correct answers marked
                    “Still guessing”.
                  </strong>{" "}
                  Explain these aloud to see whether the reasoning holds.
                </p>
                <details>
                  <summary>Read confidence counts</summary>
                  <table>
                    <thead>
                      <tr>
                        <th>Confidence</th>
                        <th>Correct</th>
                        <th>Incorrect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confidence.map((c) => (
                        <tr key={c.name}>
                          <th>{c.name}</th>
                          <td>{c.Correct}</td>
                          <td>{c.Incorrect}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </article>
            </section>
            <section className="student-panel chart-panel pace-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Pacing across the paper</p>
                  <h2>Where did your attention go?</h2>
                </div>
                <span className="student-badge">
                  <Timer size={15} /> {result.slowWrong.length} over-guide,
                  incorrect answers
                </span>
              </div>
              <p>
                Time is plotted by question number, not the order you visited.
                The dashed line is a demo practice guide, not an exam benchmark.
              </p>
              <div className="analysis-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={pace}
                    accessibilityLayer
                    margin={{ top: 15, right: 15, bottom: 10, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" name="Question" />
                    <YAxis unit="s" />
                    <Tooltip labelFormatter={(v) => `Question ${v}`} />
                    <Legend />
                    <Line
                      dataKey="seconds"
                      name="Visible question time (s)"
                      stroke="#1f5eff"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      dataKey="guide"
                      name="Practice guide (s)"
                      stroke="#a63b22"
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="student-muted">
                A long response may reflect difficult reasoning, a distraction
                or checking your work. Timing alone does not diagnose a
                weakness. Per-question values are available in question review
                and the export.
              </p>
            </section>
            <section className="student-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">The evidence behind the advice</p>
                  <h2>Three useful questions to ask yourself.</h2>
                </div>
              </div>
              <div className="student-signal-grid">
                <article className="student-panel">
                  <Target />
                  <h3>Which ideas need another look?</h3>
                  <p>
                    {result.wrong} incorrect answers give you specific reasoning
                    to revisit. Record your own cause after reading the
                    explanation.
                  </p>
                  <button
                    className="student-text-button"
                    onClick={() => review("all", "Incorrect")}
                  >
                    Review incorrect answers <ArrowRight size={16} />
                  </button>
                </article>
                <article className="student-panel">
                  <Timer />
                  <h3>What did I leave unexplored?</h3>
                  <p>
                    {result.unanswered} unanswered questions are gaps in
                    coverage. They are not proof that you lack the concept.
                  </p>
                  <button
                    className="student-text-button"
                    onClick={() => review("all", "Unanswered")}
                  >
                    Review unanswered questions <ArrowRight size={16} />
                  </button>
                </article>
                <article className="student-panel">
                  <Lightbulb />
                  <h3>Can I explain why it works?</h3>
                  <p>
                    Use the worked solutions to check your method. Tomorrow,
                    re-solve your three priority topics without looking.
                  </p>
                  <Link
                    href={`/student/tests/${attempt.subject}`}
                    className="student-text-button"
                  >
                    Retake this practice set <RotateCcw size={16} />
                  </Link>
                </article>
              </div>
            </section>
            <details className="student-methodology">
              <summary>How this report is calculated</summary>
              <p>
                Score = 4 × correct − incorrect. Multiple-select, matching and
                ordering are exact-match, with no partial credit. Accuracy =
                correct ÷ attempted; it is undefined when none are attempted.
                Topic priority sorts by marks lost relative to an all-correct
                response: 5 per wrong answer and 4 per unanswered question. Ties
                use topic name.
              </p>
              <p>
                Question timing estimates visible-tab seconds and may undercount
                during device sleep or throttling. Confidence is
                student-reported; missing confidence stays “Not recorded”.
                Topics have five questions each, so this is a limited snapshot,
                not a mastery diagnosis, rank, percentile or admission
                prediction. Practice guides and difficulty labels are
                illustrative. No cohort or invented AI prediction is used.
              </p>
            </details>
          </>
        ) : (
          <section className="student-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Understand the why</p>
                <h2>Every answer has a lesson.</h2>
              </div>
              <span>{visible.length} questions shown</span>
            </div>
            <div className="review-filters">
              <label>
                Topic
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="all">All topics</option>
                  {result.topics.map((t) => (
                    <option key={t.topic}>{t.topic}</option>
                  ))}
                </select>
              </label>
              <label>
                Outcome
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="all">All outcomes</option>
                  {["Correct", "Incorrect", "Unanswered"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Format
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="all">All formats</option>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="student-text-button"
                onClick={() => {
                  setTopic("all");
                  setStatus("all");
                  setFormat("all");
                }}
              >
                Reset filters
              </button>
            </div>
            {!visible.length && (
              <p className="student-empty">No questions match these filters.</p>
            )}
            {visible.map((r) => (
              <details className="student-panel review-question" key={r.q.id}>
                <summary>
                  <span
                    className={`review-status status-${r.status.toLowerCase()}`}
                  >
                    {r.status}
                  </span>
                  <strong>
                    Q{r.index} · {r.q.topic}
                  </strong>
                  <span>
                    {TYPE_LABELS[r.q.type]} · {time(r.seconds)} ·{" "}
                    {r.points > 0 ? "+" : ""}
                    {r.points} marks
                  </span>
                </summary>
                <QuestionContent question={r.q} />
                <div className="review-answer-grid">
                  <div>
                    <span>Your answer</span>
                    <RichText
                      text={
                        answered(r.q, r.response)
                          ? answerText(r.q, r.response!.value)
                          : "Unanswered or incomplete"
                      }
                    />
                  </div>
                  <div>
                    <span>Correct answer</span>
                    <RichText text={answerText(r.q, r.q.correct)} />
                  </div>
                </div>
                <div className="worked-explanation">
                  <h3>Let’s work through it</h3>
                  <RichText text={r.q.explanation} />
                  <p>
                    <strong>Next step:</strong> {r.q.tip}
                  </p>
                </div>
                <Reflection
                  question={r.q}
                  value={attempt.reflections[r.q.id] ?? ""}
                  onChange={(value) =>
                    updateAttempt(attempt.id, (a) => ({
                      ...a,
                      reflections: { ...a.reflections, [r.q.id]: value },
                    }))
                  }
                />
              </details>
            ))}
          </section>
        )}
      </div>
    </StudentShell>
  );
}
function Reflection({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="question-reflection">
      What would you like to work on?{" "}
      <span>Your reflection, not an automatic diagnosis.</span>
      <select
        aria-label={`Reflection for ${question.id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Choose if useful…</option>
        <option>Concept not clear yet</option>
        <option>Calculation or units</option>
        <option>Misread the question</option>
        <option>Ran out of time</option>
        <option>Guessed without a method</option>
        <option>Need a faster method</option>
        <option>Understood and ready to revisit later</option>
      </select>
    </label>
  );
}
