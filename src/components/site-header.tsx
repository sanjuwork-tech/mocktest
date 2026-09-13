"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Logo } from "@/components/logo";

const nav = [
  { href: "/exams", label: "Explore exams" },
  { href: "/test-series", label: "Preparation" },
  { href: "/about", label: "Our purpose" },
  { href: "/student", label: "Student login" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (menu.current) menu.current.open = false;
  };
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
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
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
            <nav aria-label="Mobile navigation">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
