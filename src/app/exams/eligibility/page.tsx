import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, HelpCircle, GraduationCap } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";

export const metadata = pageMetadata(
  "Eligibility for CUET, IAT, NEST & COMEDK 2027",
  "Class 12 marks, subjects, passing year and age rules for CUET UG, IISER IAT, NEST and COMEDK UGET, from the official 2026 bulletins.",
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
    slug: "cuet-ug",
    exam: "CUET (UG)",
    badge: "Most Flexible",
    authority: "National Testing Agency (NTA)",
    minMarks: "Passing grade in Class 12 (Specific university programs like DU BMS/BCom may ask 50-60%)",
    streamRequired: "Any stream. The 2026 bulletin allows papers irrespective of Class 12 subjects, but a university can require specific subjects for a course.",
    ageLimit: "No upper or lower age limit imposed by NTA (individual universities may have age conditions).",
    attemptLimit: "NTA sets no attempt limit; each university decides whether it admits earlier passouts.",
    domicileQuota: "All-India open competition for Central Universities; state quota applies only to state universities.",
  },
  {
    slug: "iiser-iat",
    exam: "IISER Aptitude Test (IAT)",
    badge: "Science Only",
    authority: "The IISERs (joint admission)",
    minMarks: "At least 60% aggregate marks (55% for SC, ST, PwD) or equivalent grade in Class 12.",
    streamRequired: "Science stream with at least three subjects among Biology, Chemistry, Mathematics and Physics.",
    ageLimit: "No age limit is stated; eligibility depends on the year you passed Class 12.",
    attemptLimit: "2026 cycle: Class 12 (or a 3-year diploma) passed in 2024, 2025 or 2026, or appearing in 2026 — three cohorts.",
    domicileQuota: "All-India admission to the 7 IISERs; IISc (BS Research) and IIT Madras (4-year BS) also used IAT 2026, with their own applications.",
  },
  {
    slug: "niser-nest",
    exam: "National Entrance Screening Test (NEST)",
    badge: "Basic Science",
    authority: "NISER Bhubaneswar & UM-DAE CEBS",
    minMarks: "At least 60% aggregate marks (55% for SC, ST, Divyangjan) in Class 12 examination.",
    streamRequired: "Science stream in regular school mode with at least 3 subjects out of PCM/B.",
    ageLimit: "No age limit (as per the official NEST information brochure).",
    attemptLimit: "2026 cycle: Class 12 passed in 2024 or 2025, or appearing in 2026.",
    domicileQuota: "All-India admission. Admitted students are eligible for the DAE DISHA scholarship (₹60,000 a year plus ₹20,000 a year for summer internships).",
  },
  {
    slug: "comedk",
    exam: "COMEDK UGET",
    badge: "Engineering",
    authority: "COMEDK Karnataka",
    minMarks: "At least 45% aggregate in Physics & Mathematics + Chemistry/Bio/CS (40% for SC/ST/OBC Karnataka).",
    streamRequired: "Physics, Mathematics as compulsory subjects along with Chemistry/Bio/Tech subject.",
    ageLimit: "COMEDK states that B.E./B.Tech eligibility follows AICTE and VTU norms; it does not set a separate age limit.",
    attemptLimit: "COMEDK does not state an attempt limit; earlier passouts are eligible as per AICTE/VTU norms.",
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
                href={item.slug === "cuet-ug" ? "/free-diagnostic" : `/free-diagnostic?exam=${item.slug}#waitlist`}
                className="text-link"
                style={{ fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                {item.slug === "cuet-ug" ? "Take a free CUET test" : "Join the waitlist"} <ArrowRight size={14} />
              </Link>
              <Link
                href={`/exams/${item.slug}`}
                className="text-link"
                style={{ fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "16px" }}
              >
                Full guide <ArrowRight size={14} />
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
              Mostly, yes. CUET and COMEDK set no passing-year limit of their own. In 2026, IAT accepted Class 12 passouts of 2024, 2025 and 2026, and NEST accepted 2024 and 2025 passouts plus students appearing in 2026.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
              Can PCB students take IISER IAT or NEST without Maths?
            </h4>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Yes, for the main programmes: IISER BS-MS and the NISER/CEBS Integrated M.Sc need any three of Biology, Chemistry, Mathematics and Physics. Both tests still include a Mathematics section, and some programmes (such as IISER B.Tech or economics degrees) require Mathematics — check the bulletin for each.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
              Can Non-Karnataka students get seats through COMEDK?
            </h4>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Yes. COMEDK is an all-India exam, and seats are allotted by COMEDK rank through its centralised counselling. Karnataka SC/ST/OBC candidates get a lower qualifying aggregate (40% instead of 45%).
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
