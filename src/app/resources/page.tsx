import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Scale,
  Sparkles,
  Target,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/catalog";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata = pageMetadata(
  "Student Resources Hub & Decision Roadmap (2026/2027)",
  "Navigate your Class 12 and dropper journey step-by-step. Discover non-JEE/NEET career options, compare entrance exams, check eligibility, explore premier colleges, and read strategy guides.",
  "/resources",
  [
    "exams after 12th science",
    "entrance exam decision guide",
    "CUET IAT NEST COMEDK roadmap",
    "college admissions guidance",
    "student preparation hub",
  ],
);

const TRACK_STAGES = [
  {
    step: "01",
    phase: "Discover",
    title: "Explore Paths Beyond JEE & NEET",
    tagline: "Break free from the two-exam trap and uncover premier universities.",
    description:
      "Most science students are funneled into JEE or NEET without ever learning about BS-MS research at IISc, Integrated MSc at DAE NISER, or domain degrees at Delhi University. Learn what opportunities exist for your interests.",
    href: "/exams/after-class-12",
    cta: "Read What Exams After Class 12 →",
    icon: Compass,
    accent: "#1f5eff",
    bg: "#eff6ff",
    badge: "Foundation Step",
  },
  {
    step: "02",
    phase: "Compare",
    title: "Side-by-Side Exam Comparison",
    tagline: "Evaluate syllabus breadth, test duration, marking penalties, and difficulty.",
    description:
      "Direct comparison of CUET UG vs IISER IAT vs NISER NEST vs COMEDK UGET. See how PCMB vs domain selection works, understand negative marking impacts (+5/−1 vs +4/−1 vs 0), and choose your priority tests.",
    href: "/exams/compare",
    cta: "View Full Comparison Matrix →",
    icon: Scale,
    accent: "#0ea5e9",
    bg: "#f0f9ff",
    badge: "Decision Matrix",
  },
  {
    step: "03",
    phase: "Verify",
    title: "Consolidated Eligibility Checker",
    tagline: "Confirm minimum Class 12 percentages, subject requirements, and gap-year rules.",
    description:
      "Never spend months studying for an exam only to face technical disqualification. Verify official NTA, IISER, and NEST criteria — including why NEST and CUET have no age limits and how droppers qualify.",
    href: "/exams/eligibility",
    cta: "Check Your Eligibility Rules →",
    icon: FileCheck2,
    accent: "#16a34a",
    bg: "#f0fdf4",
    badge: "Compliance & Age",
  },
  {
    step: "04",
    phase: "Inspire",
    title: "Top Colleges & Campus Showcase",
    tagline: "Explore premier institutes, campus architecture photos, and NIRF rankings.",
    description:
      "Visualize your destination: Delhi University North Campus, Indian Institute of Science Bangalore (Rank #1 University), NISER Bhubaneswar, and RVCE Bengaluru. Browse verified campus photos, courses, and cutoff insights.",
    href: "/colleges",
    cta: "Browse College Directory & Photos →",
    icon: GraduationCap,
    accent: "#8b5cf6",
    bg: "#faf5ff",
    badge: "Campus Directory",
  },
  {
    step: "05",
    phase: "Master",
    title: "Preparation Strategy & 2027 Guides",
    tagline: "Subject-wise master roadmaps, books, and timing strategies from mentors.",
    description:
      "Read our in-depth strategy breakdowns: How to crack CUET 60-minute domain papers, IISER IAT 4-subject cross-speed mastery, NEST sectional cutoffs (SMAS), and COMEDK speed hacks with zero negative marking.",
    href: "/blog",
    cta: "Read Exam Strategy Articles →",
    icon: BookOpen,
    accent: "#ea580c",
    bg: "#fff7ed",
    badge: "Study Strategy",
  },
  {
    step: "06",
    phase: "Validate",
    title: "Attempt Full-Length Free Mocks",
    tagline: "Test your actual preparation level with official CBT timers and pacing analytics.",
    description:
      "Take complete 50-question mock tests across 13 CUET UG domain subjects completely free. Experience the real NTA countdown clock, per-question timer, and instant accuracy breakdown.",
    href: "/free-diagnostic",
    cta: "Launch Free Full Mock Now →",
    icon: Target,
    accent: "#071a4d",
    bg: "#f1f5f9",
    badge: "100% Free Diagnostic",
  },
];

export default function ResourcesHubPage() {
  return (
    <main id="main-content" tabIndex={-1} className="page-shell section-space">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "OurMocks Student Resources Hub & Psychological Decision Roadmap",
          description:
            "A structured 6-stage guidance track for Class 12 and dropper aspirants exploring CUET, IISER, NEST, and COMEDK.",
          url: `${siteConfig.url}/resources`,
        }}
      />

      {/* Hero Header */}
      <section style={{ maxWidth: "860px", margin: "0 auto 48px auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#eff6ff",
            color: "var(--blue, #1f5eff)",
            padding: "4px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "16px",
          }}
        >
          <Sparkles size={14} /> Aspirant Decision Track
        </div>
        <h1
          style={{
            fontSize: "clamp(30px, 4.5vw, 46px)",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#0f172a",
            margin: "0 0 16px 0",
          }}
        >
          The Complete Student Roadmap:
          <br />
          <span style={{ color: "var(--blue, #1f5eff)" }}>Discover. Decide. Prepare. Score.</span>
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: "#475569",
            lineHeight: 1.6,
            maxWidth: "700px",
            margin: "0 auto 28px auto",
          }}
        >
          Choosing your academic future shouldn’t feel chaotic. Follow our interconnected 6-stage
          decision track designed to help you discover viable pathways, verify requirements, and test
          your skills under official examination conditions.
        </p>

        {/* Quick Decision Pills */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "13px",
          }}
        >
          <a
            href="#stage-01"
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#f1f5f9",
              color: "#334155",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            01 Discover
          </a>
          <a
            href="#stage-02"
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#f1f5f9",
              color: "#334155",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            02 Compare
          </a>
          <a
            href="#stage-03"
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#f1f5f9",
              color: "#334155",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            03 Eligibility
          </a>
          <a
            href="#stage-04"
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#f1f5f9",
              color: "#334155",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            04 Colleges
          </a>
          <a
            href="#stage-05"
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#f1f5f9",
              color: "#334155",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            05 Strategy
          </a>
          <a
            href="#stage-06"
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#071A4D",
              color: "#B8FF34",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            06 Free Mocks 🔥
          </a>
        </div>
      </section>

      {/* 6-Stage Roadmap Cards */}
      <section style={{ display: "flex", flexDirection: "column", gap: "28px", marginBottom: "56px" }}>
        {TRACK_STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <article
              key={stage.step}
              id={`stage-${stage.step}`}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "32px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
                alignItems: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: stage.accent,
                      background: stage.bg,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    STAGE {stage.step} · {stage.phase.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {stage.badge}
                  </span>
                </div>

                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                  {stage.title}
                </h2>
                <p style={{ fontSize: "14px", fontWeight: 600, color: stage.accent, margin: "0 0 12px 0" }}>
                  {stage.tagline}
                </p>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  {stage.description}
                </p>
              </div>

              <div
                style={{
                  background: stage.bg,
                  borderRadius: "14px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "160px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stage.accent,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>
                    Step {stage.step} of 06
                  </span>
                </div>

                <Link
                  href={stage.href}
                  style={{
                    background: stage.accent,
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <span>{stage.cta}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      {/* Dedicated Waitlist Form */}
      <WaitlistForm
        headline="Stay Ahead of the 2026/2027 Entrance Schedule"
        subheadline="Receive official notifications when examination dates, syllabus changes, and full-length test series open for enrolment."
        source="resources_hub"
      />
    </main>
  );
}
