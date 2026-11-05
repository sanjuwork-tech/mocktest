"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import "./site-chrome.css";

/** Planning pages for a Class 12 student, grouped under one menu (the old /resources hub now redirects to the first). */
const PLAN_ITEMS = [
  { href: "/exams/after-class-12", title: "Exams after Class 12", subtitle: "Options beyond JEE and NEET, by stream" },
  { href: "/exams/compare", title: "Compare the four exams", subtitle: "Questions, time and marking side by side" },
  { href: "/exams/eligibility", title: "Eligibility checker", subtitle: "Marks, subjects and passing-year rules" },
  { href: "/colleges", title: "Colleges by exam", subtitle: "Where each exam leads, with NIRF 2025 ranks" },
  { href: "/blog", title: "Guides", subtitle: "Explainers that cite the official bulletins" },
];

const isPlanPath = (path: string) =>
  PLAN_ITEMS.some((item) => path === item.href || path.startsWith(`${item.href}/`));

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const planWrap = useRef<HTMLDivElement>(null);
  const planToggle = useRef<HTMLButtonElement>(null);
  const [planOpen, setPlanOpen] = useState(false);

  // Click or tap outside the open menu closes it.
  useEffect(() => {
    if (!planOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!planWrap.current?.contains(event.target as Node)) setPlanOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [planOpen]);

  const closeMobile = () => {
    if (mobileMenu.current) mobileMenu.current.open = false;
  };
  const current = (match: boolean) => (match ? "page" : undefined);
  const planActive = isPlanPath(pathname);
  const examsActive = pathname === "/exams" || (pathname.startsWith("/exams/") && !planActive);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <p className="announcement">
        Test 1 is free for every exam we cover. CUET UG is live now; IAT, NEST and COMEDK open as each paper is released.
      </p>
      <header className="site-header">
        <div className="page-shell header-inner">
          <Logo />
          <nav className="desktop-nav sh-nav" aria-label="Main navigation">
            <Link href="/exams" aria-current={current(examsActive)}>
              Explore exams
            </Link>

            <div
              ref={planWrap}
              className="sh-menu"
              onKeyDown={(event) => {
                if (event.key === "Escape" && planOpen) {
                  setPlanOpen(false);
                  planToggle.current?.focus();
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPlanOpen(false);
              }}
            >
              <button
                ref={planToggle}
                type="button"
                className="sh-menu-toggle"
                data-active={planActive || undefined}
                aria-expanded={planOpen}
                aria-controls="sh-plan-menu"
                onClick={() => setPlanOpen((open) => !open)}
              >
                After Class 12 <ChevronDown size={16} aria-hidden="true" />
              </button>
              <ul id="sh-plan-menu" className="sh-menu-panel" hidden={!planOpen}>
                {PLAN_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={current(pathname === item.href)} onClick={() => setPlanOpen(false)}>
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/tools" aria-current={current(pathname.startsWith("/tools"))}>
              Free tools
            </Link>
            <Link href="/test-series" aria-current={current(pathname.startsWith("/test-series"))}>
              Test series
            </Link>
            <Link href="/student" aria-current={current(pathname.startsWith("/student"))}>
              Student login
            </Link>
            <Link href="/free-diagnostic" className="sh-cta" aria-current={current(pathname === "/free-diagnostic")}>
              Free Test 1
            </Link>
          </nav>

          <details
            ref={mobileMenu}
            className="mobile-nav"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeMobile();
                mobileMenu.current?.querySelector("summary")?.focus();
              }
            }}
          >
            <summary aria-label="Menu">
              <Menu aria-hidden="true" size={22} />
              <X className="close-menu" aria-hidden="true" size={22} />
            </summary>
            <nav aria-label="Mobile navigation" className="sh-mobile">
              <Link href="/free-diagnostic" onClick={closeMobile} className="sh-cta sh-mobile-cta">
                Free Test 1
              </Link>
              <Link href="/exams" onClick={closeMobile} aria-current={current(pathname === "/exams")}>
                Explore exams
              </Link>
              <p className="sh-mobile-label" id="sh-mobile-plan">
                After Class 12
              </p>
              <ul aria-labelledby="sh-mobile-plan" className="sh-mobile-group">
                {PLAN_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={closeMobile} aria-current={current(pathname === item.href)}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/tools" onClick={closeMobile} aria-current={current(pathname.startsWith("/tools"))}>
                Free tools
              </Link>
              <Link href="/test-series" onClick={closeMobile} aria-current={current(pathname.startsWith("/test-series"))}>
                Test series
              </Link>
              <Link href="/about" onClick={closeMobile} aria-current={current(pathname === "/about")}>
                About OurMocks
              </Link>
              <Link href="/student" onClick={closeMobile} aria-current={current(pathname.startsWith("/student"))}>
                Student login
              </Link>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
