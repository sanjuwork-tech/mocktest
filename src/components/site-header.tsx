"use client";

import { useState, useRef } from "react";
import { ChevronDown, Menu, X, Compass, Scale, FileCheck2, GraduationCap, BookOpen, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

const RESOURCE_ITEMS = [
  {
    href: "/resources",
    title: "Aspirant Decision Track",
    subtitle: "Complete 6-stage psychological guidance roadmap",
    icon: Sparkles,
    badge: "Start Here",
  },
  {
    href: "/exams/after-class-12",
    title: "What Exams After Class 12?",
    subtitle: "Viable non-JEE/NEET career options & streams",
    icon: Compass,
  },
  {
    href: "/exams/compare",
    title: "Side-by-Side Exam Comparison",
    subtitle: "Syllabus, marking penalties (+5/-1) & timing",
    icon: Scale,
  },
  {
    href: "/exams/eligibility",
    title: "Eligibility & Age Checker",
    subtitle: "Class 12 marks, subjects, droppers & no-age-limit rules",
    icon: FileCheck2,
  },
  {
    href: "/colleges",
    title: "Top Colleges & Campus Photos",
    subtitle: "DU, IISc, IISERs, NISER, RVCE & NIRF ranks",
    icon: GraduationCap,
  },
  {
    href: "/blog",
    title: "Preparation Strategy Blog",
    subtitle: "Authoritative 2027 cycle study roadmaps",
    icon: BookOpen,
  },
];

export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const close = () => {
    if (menu.current) menu.current.open = false;
  };

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  const isResourceActive =
    pathname.startsWith("/resources") ||
    pathname.startsWith("/colleges") ||
    pathname.startsWith("/blog") ||
    pathname === "/exams/compare" ||
    pathname === "/exams/eligibility" ||
    pathname === "/exams/after-class-12";

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="announcement">
        Your future deserves more than one entrance exam.
      </div>
      <header className="site-header">
        <div className="page-shell header-inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Main navigation" style={{ position: "relative" }}>
            <Link
              href="/exams"
              aria-current={pathname === "/exams" || (pathname.startsWith("/exams/") && !isResourceActive) ? "page" : undefined}
            >
              Explore exams
            </Link>

            {/* Resources Hub Dropdown */}
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ position: "relative", display: "inline-block" }}
            >
              <Link
                href="/resources"
                aria-current={isResourceActive ? "page" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "12px 0",
                  color: isResourceActive ? "var(--blue, #1f5eff)" : "inherit",
                  textDecoration: isResourceActive ? "underline" : "none",
                  textUnderlineOffset: "8px",
                }}
              >
                <span>Student Hub</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </Link>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "-80px",
                    width: "360px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    zIndex: 100,
                    animation: "fadeIn 0.15s ease",
                  }}
                >
                  <div style={{ padding: "6px 10px 8px 10px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Aspirant Decision Pathway
                    </span>
                  </div>
                  {RESOURCE_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          textDecoration: "none",
                          color: "#1e293b",
                          background: active ? "#f1f5f9" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = active ? "#f1f5f9" : "transparent";
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "#eff6ff",
                            color: "var(--blue, #1f5eff)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <strong style={{ fontSize: "13px", color: "#0f172a" }}>{item.title}</strong>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  background: "#B8FF34",
                                  color: "#071A4D",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "2px", lineHeight: 1.35 }}>
                            {item.subtitle}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/test-series"
              aria-current={pathname.startsWith("/test-series") ? "page" : undefined}
            >
              Test series
            </Link>

            <Link
              href="/free-diagnostic"
              aria-current={pathname === "/free-diagnostic" ? "page" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#071A4D",
                color: "#ffffff",
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(7, 26, 77, 0.15)",
              }}
            >
              <Target size={14} style={{ color: "#B8FF34" }} />
              <span>Free Mocks</span>
              <span
                style={{
                  fontSize: "10px",
                  background: "#B8FF34",
                  color: "#071A4D",
                  padding: "1px 6px",
                  borderRadius: "999px",
                  fontWeight: 800,
                }}
              >
                13 Free
              </span>
            </Link>

            <Link
              href="/student"
              aria-current={pathname.startsWith("/student") ? "page" : undefined}
            >
              Student login
            </Link>
          </nav>

          {/* Mobile Drawer */}
          <details
            ref={menu}
            className="mobile-nav"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                close();
                menu.current?.querySelector("summary")?.focus();
              }
            }}
          >
            <summary aria-label="Toggle navigation">
              <Menu aria-hidden="true" size={22} />
              <X className="close-menu" aria-hidden="true" size={22} />
            </summary>
            <nav aria-label="Mobile navigation" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <Link
                href="/free-diagnostic"
                onClick={close}
                style={{
                  background: "#071A4D",
                  color: "#B8FF34",
                  fontWeight: 800,
                  borderRadius: "10px",
                  padding: "12px 16px",
                  margin: "8px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Attempt 13 Full Tests Free</span>
                <span>🔥</span>
              </Link>

              <Link href="/exams" onClick={close} aria-current={pathname === "/exams" ? "page" : undefined}>
                Explore exams
              </Link>

              <Link href="/test-series" onClick={close} aria-current={pathname.startsWith("/test-series") ? "page" : undefined}>
                Test series
              </Link>

              {/* Student Resources Section in Mobile */}
              <div style={{ margin: "12px 0 6px 0", padding: "8px 0", borderTop: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Student Resources & Guides:
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "6px" }}>
                  {RESOURCE_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      style={{
                        padding: "8px 10px",
                        fontSize: "13px",
                        color: pathname === item.href ? "var(--blue)" : "#334155",
                        fontWeight: pathname === item.href ? 700 : 500,
                      }}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/about" onClick={close} aria-current={pathname === "/about" ? "page" : undefined}>
                Our purpose & Team
              </Link>

              <Link href="/student" onClick={close} aria-current={pathname.startsWith("/student") ? "page" : undefined}>
                Student login
              </Link>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
