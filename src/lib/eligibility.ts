// Eligibility rules from the 2026 bulletins (checked 2026-10-27). The 2027 bulletins are not out, so passing-year
// windows are the 2026 windows moved forward one year; the page says so. Update here when the 2027 rules publish.

export type Subject = "physics" | "chemistry" | "mathematics" | "biology" | "english" | "computer-science";
export type EligibilityInput = {
  /** Year Class 12 was or will be passed; "earlier" means 2024 or before. */
  passYear: "2027" | "2026" | "2025" | "earlier";
  subjects: Subject[];
  /** Class 12 aggregate percentage, expected if still appearing; null when not entered. */
  percent: number | null;
  /** SC, ST or PwD (IAT and NEST relax the aggregate to 55%). */
  reserved: boolean;
  /** Karnataka SC, ST or OBC (COMEDK relaxes the aggregate to 40%). */
  karnatakaReserved: boolean;
};
export type Verdict = { status: "eligible" | "not-eligible" | "check"; reasons: string[] };

const SCIENCES: Subject[] = ["physics", "chemistry", "mathematics", "biology"];

function marks(percent: number | null, needed: number, reasons: string[]): Verdict["status"] {
  if (percent === null) {
    reasons.push(`Needs at least ${needed}% in Class 12. Enter your percentage to check.`);
    return "check";
  }
  if (percent < needed) {
    reasons.push(`Needs at least ${needed}% in Class 12; you entered ${percent}%.`);
    return "not-eligible";
  }
  return "eligible";
}

// The worst status wins: any failed rule makes the exam not eligible, any unknown makes it "check".
const combine = (statuses: Verdict["status"][]): Verdict["status"] =>
  statuses.includes("not-eligible") ? "not-eligible" : statuses.includes("check") ? "check" : "eligible";

/** IAT and NEST share the 2026 shape: three passing-year cohorts, three of PCMB, 60% (55% reserved). */
function scienceExam(input: EligibilityInput): Verdict {
  const reasons: string[] = [];
  const statuses: Verdict["status"][] = [];
  if (input.passYear === "earlier") {
    reasons.push("Only students passing Class 12 in 2025, 2026 or 2027 are expected to qualify.");
    statuses.push("not-eligible");
  }
  const sciences = SCIENCES.filter((s) => input.subjects.includes(s)).length;
  if (sciences < 3) {
    reasons.push(`Needs at least three of Physics, Chemistry, Mathematics and Biology; you have ${sciences}.`);
    statuses.push("not-eligible");
  }
  statuses.push(marks(input.percent, input.reserved ? 55 : 60, reasons));
  return { status: combine(statuses), reasons };
}

function comedk(input: EligibilityInput): Verdict {
  const reasons: string[] = [];
  const statuses: Verdict["status"][] = [];
  const has = (s: Subject) => input.subjects.includes(s);
  const missing = (["physics", "mathematics", "english"] as const).filter((s) => !has(s));
  if (missing.length) {
    reasons.push(`Physics, Mathematics and English are compulsory; missing ${missing.join(", ")}.`);
    statuses.push("not-eligible");
  }
  if (!has("chemistry") && !has("biology") && !has("computer-science")) {
    reasons.push("Needs one optional subject: Chemistry, Biology or Computer Science.");
    statuses.push("not-eligible");
  }
  statuses.push(marks(input.percent, input.karnatakaReserved ? 40 : 45, reasons));
  if (input.percent !== null) reasons.push("COMEDK counts the aggregate of Physics, Mathematics and your optional subject.");
  return { status: combine(statuses), reasons };
}

export function checkEligibility(input: EligibilityInput): Record<"cuet-ug" | "iiser-iat" | "niser-nest" | "comedk", Verdict> {
  return {
    "cuet-ug": {
      status: "eligible",
      reasons: ["NTA sets no marks, stream or age limit. Each university can add its own conditions for a course."],
    },
    "iiser-iat": scienceExam(input),
    "niser-nest": scienceExam(input),
    comedk: comedk(input),
  };
}
