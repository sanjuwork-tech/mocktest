import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, HelpCircle, GraduationCap } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";

export const metadata = pageMetadata(
  "Eligibility Criteria 2026/2027 — CUET, IISER IAT, NEST & COMEDK",
  "Complete consolidated eligibility guide for CUET UG, IISER IAT, NEST, and COMEDK UGET. Check minimum Class 12 marks, stream requirements, attempt limits, and age restrictions.",
  "/exams/eligibility",
  [
    "CUET eligibility criteria 2026",
    "IISER IAT eligibility marks",
    "NEST exam age limit",
    "COMEDK percentage required in 12th",
    "entrance exam eligibility checker",
  ],
);

const ELIGIBILITY_DATA = [
  {
    exam: "CUET (UG)",
    badge: "Most Flexible",
    authority: "National Testing Agency (NTA)",
    minMarks: "Passing grade in Class 12 (Specific university programs like DU BMS/BCom may ask 50-60%)",
    streamRequired: "Any stream (Science, Commerce, Arts/Humanities). You must pick domain subjects studied in Class 12.",
    ageLimit: "No upper or lower age limit imposed by NTA (individual universities may have age conditions).",
    attemptLimit: "No limit on number of attempts; gap year / droppers eligible.",
    domicileQuota: "All-India open competition for Central Universities; state quota applies only to state universities.",
  },
  {
    exam: "IISER Aptitude Test (IAT)",
    badge: "Science Only",
    authority: "Joint Admissions Committee (IISERs)",
    minMarks: "At least 60% aggregate marks (55% for SC, ST, PwD) or equivalent grade in Class 12.",
    streamRequired: "Science stream with at least three subjects among Biology, Chemistry, Mathematics and Physics.",
    ageLimit: "No age limit (eligibility governed by Class 12 qualifying year: 2024, 2025, or appearing in 2026/2027).",
    attemptLimit: "Candidates are eligible within two years of passing Class 12.",
    domicileQuota: "All-India open seats across all 7 IISERs, IISc Bangalore (BS), and IIT Madras (BS Medical Sciences).",
  },
  {
    exam: "National Entrance Screening Test (NEST)",
    badge: "Basic Science",
    authority: "NISER Bhubaneswar & UM-DAE CEBS",
    minMarks: "At least 60% aggregate marks (55% for SC, ST, Divyangjan) in Class 12 examination.",
    streamRequired: "Science stream in regular school mode with at least 3 subjects out of PCM/B.",
    ageLimit: "No age limit (as per the official NEST information brochure).",
    attemptLimit: "Passed Class 12 in 2024, 2025 or appearing in 2026/2027.",
    domicileQuota: "All-India open admissions. Admitted students maintaining academic criteria are eligible for DISHA scholarship (₹60,000/yr + mentorship) under DAE norms.",
  },
  {
    exam: "COMEDK UGET",
    badge: "Engineering",
    authority: "COMEDK Karnataka",
    minMarks: "At least 45% aggregate in Physics & Mathematics + Chemistry/Bio/CS (40% for SC/ST/OBC Karnataka).",
    streamRequired: "Physics, Mathematics as compulsory subjects along with Chemistry/Bio/Tech subject.",
    ageLimit: "Must have completed 17 years of age on or before 31st December of the admission year.",
    attemptLimit: "No limit on attempts for engineering entrance.",
    domicileQuota: "Open to students from all states across India (Non-Karnataka candidates eligible for private seats).",
  },
];

export default function EligibilityGuidePage() {
  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Complete Eligibility Criteria: CUET UG, IISER IAT, NEST, and COMEDK",
          description: "Consolidated rules on Class 12 percentage, age limits, stream requirements and attempt rules.",
        }}
      />

      <section style={{ maxWidth: "840px", margin: "0 auto 40px auto", textAlign: "center" }}>
        <p className="eyebrow">Consolidated Admissions Check · Class 12 & Droppers</p>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.2, margin: "8px 0 16px 0" }}>
          Entrance Exam Eligibility Criteria (2026/2027)
        </h1>
        <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto" }}>
          Before investing months in preparation, make sure you meet the official eligibility requirements for Class 12 minimum marks, subject stream combinations, age thresholds, and gap-year rules.
        </p>
      </section>

      {/* Cards Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "48px" }}>
        {ELIGIBILITY_DATA.map((item) => (
          <article
            key={item.exam}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "var(--blue, #1f5eff)",
                    background: "#eff6ff",
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  {item.badge}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{item.authority}</span>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
                {item.exam}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
                <div>
                  <strong style={{ display: "block", color: "#1e293b", marginBottom: "3px" }}>
                    Minimum Class 12 Marks:
                  </strong>
                  <p style={{ color: "#475569", margin: 0, lineHeight: 1.5 }}>{item.minMarks}</p>
                </div>

                <div>
                  <strong style={{ display: "block", color: "#1e293b", marginBottom: "3px" }}>
                    Stream & Subject Eligibility:
                  </strong>
                  <p style={{ color: "#475569", margin: 0, lineHeight: 1.5 }}>{item.streamRequired}</p>
                </div>

                <div>
                  <strong style={{ display: "block", color: "#1e293b", marginBottom: "3px" }}>
                    Age Criteria & Qualifying Year:
                  </strong>
                  <p style={{ color: "#475569", margin: 0, lineHeight: 1.5 }}>{item.ageLimit}</p>
                </div>

                <div>
                  <strong style={{ display: "block", color: "#1e293b", marginBottom: "3px" }}>
                    Attempt Limits & Droppers:
                  </strong>
                  <p style={{ color: "#475569", margin: 0, lineHeight: 1.5 }}>{item.attemptLimit}</p>
                </div>

                <div>
                  <strong style={{ display: "block", color: "#1e293b", marginBottom: "3px" }}>
                    State Domicile vs All-India:
                  </strong>
                  <p style={{ color: "#475569", margin: 0, lineHeight: 1.5 }}>{item.domicileQuota}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              <Link
                href="/free-diagnostic"
                className="text-link"
                style={{ fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                Attempt {item.exam.includes("CUET") ? "Free Full Test" : "Practice Mock / Join Waitlist"} <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Quick Summary Advice */}
      <section
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "32px",
          textAlign: "left",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
          Frequently Asked Eligibility Questions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
              Can droppers / gap-year students write these exams?
            </h4>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Yes. CUET and COMEDK have no year restriction. IISER IAT and NEST accept candidates who passed within the immediate preceding two years (e.g. 2024 or 2025 for 2026 attempt).
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
              Can PCB students take IISER IAT or NEST without Maths?
            </h4>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Yes! PCB students are fully eligible. While the test contains a Mathematics section, strong scores in Physics, Chemistry, and Biology often comfortably clear the admission cutoff.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
              Can Non-Karnataka students get seats through COMEDK?
            </h4>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Yes. COMEDK is explicitly an All-India exam open to students from all states. Seats are allotted strictly based on COMEDK merit ranks without state reservation barriers.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
