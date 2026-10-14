"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ExternalLink,
  Award,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Building2,
} from "lucide-react";
import { collegesData, type College } from "@/data/colleges";
import type { ExamKey } from "@/data/catalog";

type Props = {
  examSlug?: ExamKey;
  heading?: string;
  subheading?: string;
  showFilters?: boolean;
};

export function CollegesShowcase({
  examSlug,
  heading = "Top Colleges & Participating Universities",
  subheading = "Explore premier institutions, admissions, campus photos, and courses unlocked by your entrance exam attempt.",
  showFilters = true,
}: Props) {
  const [selectedExam, setSelectedExam] = useState<string>(examSlug || "all");

  const filtered = collegesData.filter((college) => {
    if (examSlug) return college.examSlug === examSlug;
    if (selectedExam !== "all") return college.examSlug === selectedExam;
    return true;
  });

  return (
    <section className="section-space" style={{ margin: "32px 0" }}>
      <div className="section-heading" style={{ marginBottom: "24px" }}>
        <div>
          <p className="eyebrow">Premier Higher Education Institutions</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: "#0f172a" }}>
            {heading}
          </h2>
          <p style={{ color: "#475569", fontSize: "15px", marginTop: "6px", maxWidth: "680px" }}>
            {subheading}
          </p>
        </div>
      </div>

      {/* Filter Tabs if examSlug not hardcoded */}
      {!examSlug && showFilters && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
          {[
            { id: "all", label: "All Institutions" },
            { id: "cuet-ug", label: "CUET Central Universities" },
            { id: "iiser-iat", label: "IISERs & IISc (IAT)" },
            { id: "niser-nest", label: "NISER & CEBS (NEST)" },
            { id: "comedk", label: "Top Karnataka Engineering (COMEDK)" },
          ].map((tab) => {
            const isSelected = selectedExam === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedExam(tab.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isSelected ? "2px solid #1f5eff" : "1px solid #cbd5e1",
                  background: isSelected ? "#1f5eff" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#475569",
                  boxShadow: isSelected ? "0 4px 12px rgba(31, 94, 255, 0.15)" : "none",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Colleges */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "28px",
        }}
      >
        {filtered.map((college) => (
          <article
            key={college.id}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {/* Campus Image Header */}
            <div style={{ position: "relative", width: "100%", height: "200px", background: "#f1f5f9" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={college.imageUrl}
                alt={`${college.name} Campus`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(7, 26, 77, 0.8) 100%)",
                }}
              />

              {/* Badge Overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(4px)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#0f172a",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <Sparkles size={12} color="#1f5eff" /> {college.badge}
              </div>

              {/* NIRF Rank pill */}
              {college.nirfRank && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "#b8ff34",
                    color: "#071a4d",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                  }}
                >
                  {college.nirfRank}
                </div>
              )}

              {/* Bottom text inside image */}
              <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px", color: "#ffffff" }}>
                <span
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "rgba(255,255,255,0.85)",
                    marginBottom: "3px",
                  }}
                >
                  <MapPin size={13} /> {college.location}, {college.state}
                </span>
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1.25,
                    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  }}
                >
                  {college.name}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, margin: "0 0 16px 0" }}>
                  {college.overview}
                </p>

                {/* Popular Courses Pills */}
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                    Popular Programmes via {college.examSlug.toUpperCase()}:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {college.popularCourses.map((course) => (
                      <span
                        key={course}
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          background: "#f1f5f9",
                          color: "#1e293b",
                          padding: "3px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Highlights */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", display: "block", marginBottom: "6px" }}>
                    Campus & Academic Highlights:
                  </span>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {college.keyHighlights.map((hl) => (
                      <li
                        key={hl}
                        style={{
                          fontSize: "12px",
                          color: "#334155",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "6px",
                          lineHeight: 1.4,
                        }}
                      >
                        <CheckCircle2 size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Links */}
              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <a
                  href={college.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "12px",
                    color: "var(--blue, #1f5eff)",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none",
                  }}
                >
                  Official Portal <ExternalLink size={12} />
                </a>

                <Link
                  href="/free-diagnostic"
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "#071A4D",
                    color: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Prepare Mocks <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
