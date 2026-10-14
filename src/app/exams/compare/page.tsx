import Link from "next/link";
import { ArrowRight, Check, Minus, Sparkles, HelpCircle } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";

export const metadata = pageMetadata(
  "CUET vs IISER IAT vs NEST vs COMEDK — Full Exam Comparison (2026/2027)",
  "Compare CUET UG, IISER IAT, NEST, and COMEDK side-by-side. Eligibility, exam pattern, marking scheme, question format, and career outcomes compared for Class 12 aspirants.",
  "/exams/compare",
  [
    "CUET vs IAT",
    "IISER vs NEST",
    "COMEDK vs CUET",
    "entrance exam comparison 2026",
    "exams after 12th science",
    "best exams after class 12",
  ],
);

const COMPARISON_ROWS = [
  {
    feature: "Primary Focus & Target Courses",
    cuet: "BA, BSc, BCom, BCA, BTech at 250+ Central, State & Private Universities",
    iat: "5-Year BS-MS Dual Degree in Science & Research (IISERs, IISc, IIT Madras)",
    nest: "5-Year Integrated MSc in Basic Sciences (NISER Bhubaneswar & UM-DAE CEBS Mumbai)",
    comedk: "4-Year B.E. / B.Tech in 190+ Premier Engineering Colleges across Karnataka",
  },
  {
    feature: "Conducting Body",
    cuet: "National Testing Agency (NTA)",
    iat: "Joint Admissions Committee (IISERs)",
    nest: "NISER Bhubaneswar & UM-DAE CEBS",
    comedk: "Consortium of Medical, Engineering & Dental Colleges of Karnataka",
  },
  {
    feature: "Subjects Tested",
    cuet: "Choice of up to 6 subjects (13 Domains, Languages, General Test)",
    iat: "Compulsory PCMB (Physics, Chemistry, Maths, Biology)",
    nest: "PCMB (Physics, Chemistry, Maths, Biology - Best 3 or all 4 scored)",
    comedk: "Compulsory PCM (Physics, Chemistry, Mathematics)",
  },
  {
    feature: "Question Count & Duration",
    cuet: "50 Questions per subject · 90 Minutes per slot",
    iat: "60 Questions (15 per subject) · 180 Minutes (3 Hours)",
    nest: "80 Questions (20 per subject) · 210 Minutes (3.5 Hours)",
    comedk: "180 Questions (60 per subject) · 180 Minutes (3 Hours)",
  },
  {
    feature: "Marking Scheme",
    cuet: "+4 for correct, −1 for incorrect, 0 unanswered",
    iat: "+4 for correct, −1 for incorrect, 0 unanswered",
    nest: "+4 or +2.5 depending on section, negative marking varies",
    comedk: "+1 for correct, NO negative marking (0 penalty)",
  },
  {
    feature: "Class 12 Eligibility",
    cuet: "Pass in Class 12 with required domain subjects (No strict minimum % for general)",
    iat: "Class 12 with at least 60% marks (55% for SC/ST/PwD) in Science stream",
    nest: "Class 12 with at least 60% marks (55% for SC/ST/PwD) in Science stream",
    comedk: "Class 12 with at least 45% aggregate in Physics & Maths + Chemistry/Bio",
  },
  {
    feature: "Difficulty Benchmark",
    cuet: "Moderate (strictly NCERT Class 12 syllabus)",
    iat: "Advanced conceptual (NCERT + research aptitude application)",
    nest: "Very high (multi-step analytical science problems)",
    comedk: "Moderate speed-intensive (1 question per minute speed)",
  },
  {
    feature: "Practice Mock Availability",
    cuet: "13 Full-Length Domain Tests Available Free Now",
    iat: "Coming Soon (Adding in upcoming days)",
    nest: "Coming Soon (Adding in upcoming days)",
    comedk: "Coming Soon (Adding in upcoming days)",
  },
];

export default function CompareExamsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Table",
          name: "Entrance Exam Comparison: CUET UG vs IISER IAT vs NEST vs COMEDK",
          about: "Detailed side-by-side comparison of entrance exams after Class 12",
        }}
      />

      <section style={{ maxWidth: "880px", margin: "0 auto 40px auto", textAlign: "center" }}>
        <p className="eyebrow">Beyond JEE & NEET · Complete Comparison Guide</p>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.2, margin: "8px 0 16px 0" }}>
          CUET UG vs IISER IAT vs NEST vs COMEDK
        </h1>
        <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto" }}>
          Choosing which exam to focus on after Class 12 determines your preparation strategy. Compare syllabus breadth, marking schemes, difficulty levels, and career outcomes side-by-side.
        </p>
      </section>

      {/* Comparison Table */}
      <section style={{ overflowX: "auto", marginBottom: "48px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            fontSize: "14px",
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          <thead>
            <tr style={{ background: "#071A4D", color: "#ffffff", textAlign: "left" }}>
              <th style={{ padding: "18px 20px", width: "22%", fontWeight: 700 }}>Parameter</th>
              <th style={{ padding: "18px 20px", width: "20%", fontWeight: 700 }}>
                CUET (UG)
                <span style={{ display: "block", fontSize: "11px", color: "#93c5fd", fontWeight: 400 }}>Central Universities</span>
              </th>
              <th style={{ padding: "18px 20px", width: "19%", fontWeight: 700 }}>
                IISER IAT
                <span style={{ display: "block", fontSize: "11px", color: "#bbf7d0", fontWeight: 400 }}>BS-MS Research</span>
              </th>
              <th style={{ padding: "18px 20px", width: "19%", fontWeight: 700 }}>
                NISER NEST
                <span style={{ display: "block", fontSize: "11px", color: "#fed7aa", fontWeight: 400 }}>Integrated MSc</span>
              </th>
              <th style={{ padding: "18px 20px", width: "20%", fontWeight: 700 }}>
                COMEDK UGET
                <span style={{ display: "block", fontSize: "11px", color: "#e9d5ff", fontWeight: 400 }}>Karnataka Engineering</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={row.feature}
                style={{
                  background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                  borderBottom: i === COMPARISON_ROWS.length - 1 ? "none" : "1px solid #e2e8f0",
                }}
              >
                <td style={{ padding: "16px 20px", fontWeight: 700, color: "#1e293b", verticalAlign: "top" }}>
                  {row.feature}
                </td>
                <td style={{ padding: "16px 20px", color: "#334155", verticalAlign: "top", lineHeight: 1.5 }}>
                  {row.cuet}
                </td>
                <td style={{ padding: "16px 20px", color: "#334155", verticalAlign: "top", lineHeight: 1.5 }}>
                  {row.iat}
                </td>
                <td style={{ padding: "16px 20px", color: "#334155", verticalAlign: "top", lineHeight: 1.5 }}>
                  {row.nest}
                </td>
                <td style={{ padding: "16px 20px", color: "#334155", verticalAlign: "top", lineHeight: 1.5 }}>
                  {row.comedk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Free Test CTA Block */}
      <section
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
          border: "1px solid #bfdbfe",
          borderRadius: "16px",
          padding: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "48px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#1d4ed8",
              background: "#dbeafe",
              padding: "4px 10px",
              borderRadius: "999px",
            }}
          >
            Immediate Practice
          </span>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "8px 0 6px 0" }}>
            Ready to test your readiness?
          </h2>
          <p style={{ fontSize: "14px", color: "#475569", margin: 0, maxWidth: "560px" }}>
            Attempt <strong>CUET UG full-length 50-question mock tests</strong> across 13 subjects completely free. IISER, NEST and COMEDK mocks will be added in upcoming days.
          </p>
        </div>
        <Link href="/free-diagnostic" className="button-primary">
          Attempt Free Full-Length Mock <ArrowRight size={18} />
        </Link>
      </section>

      {/* Summary Decision Matrix */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1f5eff", marginBottom: "8px" }}>
            Choose CUET (UG) if:
          </h3>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            You want flexibility to pursue top central universities like DU, BHU, JNU, or Hyderabad University for Arts, Commerce, Science, or BCA/Tech degrees with domain-specific tests.
          </p>
        </div>

        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#15803d", marginBottom: "8px" }}>
            Choose IISER IAT if:
          </h3>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            You have a genuine passion for natural sciences, research, and academia, and want admission to premier institutes like IISc Bangalore, 7 IISERs, or IIT Madras BS programs.
          </p>
        </div>

        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#c2410c", marginBottom: "8px" }}>
            Choose NISER NEST if:
          </h3>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            You aim for nuclear and basic science research funded directly by the Department of Atomic Energy (DAE) with generous DISHA scholarships and BARC direct interview pathways.
          </p>
        </div>

        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#6b21a8", marginBottom: "8px" }}>
            Choose COMEDK UGET if:
          </h3>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
            You want an alternative to JEE Main for high-tier private engineering education in Bengaluru and Karnataka (RVCE, BMSCE, MSRIT) with zero negative marking.
          </p>
        </div>
      </section>
    </main>
  );
}
