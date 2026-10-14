import Link from "next/link";
import { ArrowRight, Compass, GraduationCap, Microscope, Cpu, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";

export const metadata = pageMetadata(
  "What Exams to Take After Class 12 (Beyond JEE & NEET) — 2026/2027 Guide",
  "Discover premier entrance exams after Class 12 Science, Commerce, and Humanities. Explore CUET UG, IISER IAT, NISER NEST, and COMEDK with career pathways and preparation strategies.",
  "/exams/after-class-12",
  [
    "exams after 12th science",
    "entrance exams after 12th beyond JEE",
    "best options after class 12",
    "CUET after 12th",
    "research careers after 12th",
    "exams after 12th commerce",
  ],
);

export default function AfterClass12GuidePage() {
  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Complete Guide: Entrance Exams After Class 12 Beyond JEE & NEET",
          description: "Explore opportunities in central universities, pure science research, and engineering via CUET, IAT, NEST, and COMEDK.",
        }}
      />

      <section style={{ maxWidth: "840px", margin: "0 auto 48px auto", textAlign: "center" }}>
        <p className="eyebrow">Career Discovery · Class 12 Admissions</p>
        <h1 style={{ fontSize: "clamp(30px, 4.5vw, 46px)", fontWeight: 800, lineHeight: 1.15, margin: "8px 0 18px 0" }}>
          Your future has more options
          <br />
          <em style={{ fontStyle: "normal", color: "var(--blue, #1f5eff)" }}>
            than just JEE Main and NEET.
          </em>
        </h1>
        <p style={{ fontSize: "16px", color: "#475569", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto 28px auto" }}>
          Every year, millions of students assume JEE and NEET are the only pathways. But India’s premier central universities, scientific research institutes, and top engineering colleges conduct focused exams built for diverse strengths.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/free-diagnostic" className="button-primary">
            Attempt Free Full-Length Mock <ArrowRight size={16} />
          </Link>
          <Link href="/exams/compare" className="text-link" style={{ fontSize: "14px", fontWeight: 600 }}>
            Compare all 4 exams side-by-side ↗
          </Link>
        </div>
      </section>

      {/* Pathways Breakdown by Stream */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "56px" }}>
        {/* Pathway 1: Research in Pure Sciences */}
        <article style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Microscope size={26} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#16a34a" }}>Natural Science & Research</span>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "6px 0 12px 0" }}>
            IISER IAT & NISER NEST
          </h2>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "18px" }}>
            If you are curious about astrophysics, quantum physics, molecular biology, organic synthesis, or computational mathematics, these two exams lead to 5-year BS-MS / MSc degrees at IISERs, IISc, IIT Madras, and NISER.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#334155" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "#16a34a" }} /> ₹60,000/yr scholarships available (DISHA / INSPIRE)
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "#16a34a" }} /> Direct pathway to PhDs at MIT, Stanford, Max Planck
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "#16a34a" }} /> High laboratory and computational exposure
            </li>
          </ul>
          <Link href="/test-series/iiser-iat" className="text-link" style={{ fontSize: "13px", fontWeight: 600 }}>
            Explore IISER Series Details ↗
          </Link>
        </article>

        {/* Pathway 2: Prestigious Central Universities */}
        <article style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#eff6ff", color: "var(--blue, #1f5eff)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <GraduationCap size={26} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--blue, #1f5eff)" }}>All Streams (Science, Commerce, Arts)</span>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "6px 0 12px 0" }}>
            CUET (UG) Central Universities
          </h2>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "18px" }}>
            Conducted by NTA for Delhi University (SRCC, St. Stephen&apos;s, Hindu), BHU, JNU, and 250+ top colleges. Offers BA (Hons), BCom (Hons), BSc, BCA, and Economics with strictly Class 12 NCERT syllabus.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#334155" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "var(--blue)" }} /> 13 Domain subjects live with 100% free test papers
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "var(--blue)" }} /> Highly affordable university tuition fees
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "var(--blue)" }} /> Top corporate placements in consulting, banking & tech
            </li>
          </ul>
          <Link href="/free-diagnostic" className="text-link" style={{ fontSize: "13px", fontWeight: 600 }}>
            Attempt Free Full-Length CUET Mock ↗
          </Link>
        </article>

        {/* Pathway 3: High-Tech Engineering */}
        <article style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Cpu size={26} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#d97706" }}>Engineering & Technology</span>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "6px 0 12px 0" }}>
            COMEDK UGET Engineering
          </h2>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "18px" }}>
            Bengaluru is India&apos;s Silicon Valley. COMEDK provides admission to 190+ high-tier private engineering colleges like RVCE, BMS College of Engineering, and MS Ramaiah without negative marking.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#334155" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "#d97706" }} /> 180 questions in 180 mins with ZERO negative marking
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "#d97706" }} /> High placement averages (₹12–20 LPA at RVCE/BMSCE)
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={15} style={{ color: "#d97706" }} /> Great alternative to JEE Main for non-Karnataka students
            </li>
          </ul>
          <Link href="/test-series/comedk" className="text-link" style={{ fontSize: "13px", fontWeight: 600 }}>
            Explore COMEDK Series Details ↗
          </Link>
        </article>
      </section>

      {/* Strategic 3-Step Framework */}
      <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "36px", textAlign: "left" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
          How to Decide Your Exam Portfolio in 3 Steps
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginTop: "20px" }}>
          <div>
            <strong style={{ fontSize: "15px", color: "#1e293b", display: "block", marginBottom: "6px" }}>
              1. Never rely on a single exam
            </strong>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Testing day anxiety, shift-difficulty variance, and health bugs happen. Preparing for 2–3 overlapping exams (e.g. JEE + COMEDK + CUET, or IAT + NEST + CUET) ensures your effort pays off.
            </p>
          </div>
          <div>
            <strong style={{ fontSize: "15px", color: "#1e293b", display: "block", marginBottom: "6px" }}>
              2. Exploit syllabus overlap
            </strong>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              CUET UG, IISER IAT, and COMEDK all use NCERT Class 11 and 12 foundations. Your Physics, Chemistry, and Math/Bio concepts remain the exact same — only question speed and depth differ.
            </p>
          </div>
          <div>
            <strong style={{ fontSize: "15px", color: "#1e293b", display: "block", marginBottom: "6px" }}>
              3. Take diagnostic tests early
            </strong>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Attempt our free full-length test papers to uncover whether you thrive on fast questions (COMEDK/CUET) or conceptual problem-solving (IAT/NEST).
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
