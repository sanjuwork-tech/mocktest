import type { TabProps } from "../result-view";
import { DivergingRows, Figure, Legend, StackRows } from "./charts";
import { fmt, plural, signed } from "./format";

export function DecisionsTab({ a, label, jump }: TabProps) {
  const c = a.changes;
  const r = a.review;
  const g = a.guesses;
  const changed = a.questions.filter((q) => q.changeKind);
  const ifSkipped = a.score.score - g.net;
  const kindRows = [
    { label: "Wrong to right", kind: "wrong-to-right", count: c.wrongToRight },
    { label: "Right to wrong or blank", kind: "right-to-wrong", count: c.rightToWrong },
    { label: "Wrong to another wrong", kind: "wrong-to-wrong", count: c.wrongToWrong },
    { label: "Changed, back to right", kind: "right-to-right", count: c.rightToRight },
  ].map((k) => ({ ...k, value: changed.filter((q) => q.changeKind === k.kind).reduce((n, q) => n + q.changeDelta, 0) }));

  return (
    <>
      <Figure
        id="rx-changes"
        title="Answer changes"
        takeaway={
          c.total === 0
            ? "You kept every first answer, so changes neither helped nor hurt."
            : `You changed ${plural(c.total, "answer")}: a net ${signed(c.net)} marks (${signed(c.gained)} gained, −${c.lost} lost).`
        }
        table={
          changed.length > 0 && (
            <table className="rx-table-plain">
              <thead>
                <tr>
                  <th scope="col">Question</th>
                  <th scope="col">What changed</th>
                  <th scope="col">Times changed</th>
                  <th scope="col">Marks</th>
                </tr>
              </thead>
              <tbody>
                {changed.map((q) => (
                  <tr key={q.index}>
                    <th scope="row">
                      <button type="button" className="rx-link" onClick={() => jump(q.index)}>
                        {label(q.index)}
                      </button>
                    </th>
                    <td>{kindRows.find((k) => k.kind === q.changeKind)?.label}</td>
                    <td>{q.changes}</td>
                    <td>{signed(q.changeDelta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      >
        {c.total > 0 && (
          <>
            <DivergingRows
              label={`Marks gained and lost by changing answers: ${kindRows.map((k) => `${k.label} ${k.count}, ${signed(k.value)} marks`).join("; ")}.`}
              rows={kindRows.map((k) => ({ label: k.label, value: k.value, note: plural(k.count, "question") }))}
            />
            <Legend
              items={[
                { cls: "rx-gain", label: "Marks gained" },
                { cls: "rx-loss", label: "Marks lost" },
              ]}
            />
          </>
        )}
      </Figure>

      <Figure
        id="rx-marked"
        title="Marked for review"
        takeaway={
          r.marked === 0
            ? "You didn't mark any question for review."
            : `Of ${plural(r.marked, "marked question")}, you ${r.revisited ? `came back to ${r.revisited}` : "came back to none"}; ${r.markedCorrect} ended right, ${r.markedWrong} wrong and ${r.markedUnanswered} blank.`
        }
      >
        {r.marked > 0 && (
          <>
            <StackRows
              label={`Marked questions: ${r.markedCorrect} right, ${r.markedWrong} wrong, ${r.markedUnanswered} blank.`}
              max={r.marked}
              rows={[
                {
                  label: "Marked",
                  total: r.marked,
                  parts: [
                    { cls: "rx-o-correct", value: r.markedCorrect, name: "Right" },
                    { cls: "rx-o-wrong", value: r.markedWrong, name: "Wrong" },
                    { cls: "rx-o-blank", value: r.markedUnanswered, name: "Blank" },
                  ],
                },
              ]}
            />
            <Legend
              items={[
                { cls: "rx-o-correct", label: `Right ${r.markedCorrect}` },
                { cls: "rx-o-wrong", label: `Wrong ${r.markedWrong}` },
                { cls: "rx-o-blank", label: `Blank ${r.markedUnanswered}` },
              ]}
            />
          </>
        )}
      </Figure>

      <Figure
        id="rx-guesses"
        title={`Quick answers (under ${fmt(g.thresholdMs)})`}
        takeaway={
          !a.time.recorded
            ? "Time per question wasn't recorded for this attempt, so quick answers can't be identified."
            : g.count === 0
              ? `You didn't answer anything in under ${fmt(g.thresholdMs)}.`
              : !g.penaltyExam
                ? `${g.correct} of ${g.count} quick answers were right. With no negative marking, a guess can only help.`
                : g.net < 0
                  ? `${g.wrong} of ${g.count} quick answers were wrong. Skipping all of them would have scored ${-g.net} more.`
                  : `${g.correct} of ${g.count} quick answers were right, a net ${signed(g.net)}: your fast calls paid off.`
        }
      >
        {a.time.recorded && g.count > 0 && g.penaltyExam && (
          <StackRows
            label={`Your score ${a.score.score}; if you had skipped the quick answers, ${ifSkipped}.`}
            max={Math.max(a.score.score, ifSkipped, 1)}
            rows={[
              { label: "Your score", total: a.score.score, parts: [{ cls: "rx-o-correct", value: a.score.score, name: "Your score" }] },
              { label: "If you had skipped them", total: ifSkipped, parts: [{ cls: "rx-o-max", value: ifSkipped, name: "If skipped" }] },
            ]}
          />
        )}
      </Figure>
    </>
  );
}
