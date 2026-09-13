"use client";

import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";

const nav = [
  { href: "/test-series", label: "Test Series" },
  { href: "/results", label: "Results" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="bg-navy px-4 py-2 text-center font-mono text-[10px] font-medium uppercase tracking-[.14em] text-white">
        2026 all-India mocks are live <span className="mx-2 text-lime">●</span> Use FIRST100 for 20% off
      </div>
      <header className="sticky top-0 z-50 border-b border-navy/10 bg-paper/90 backdrop-blur-xl">
        <div className="page-shell flex h-[76px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? "text-blue" : "text-navy/70"}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="icon-button" aria-label="Open shopping bag"><ShoppingBag size={18} /><span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-coral text-[9px] font-bold text-white">0</span></button>
            <Link href="/test-series" className="button-primary hidden sm:inline-flex">Start practising <span>↗</span></Link>
            <button className="icon-button lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={19} /></button>
          </div>
        </div>
      </header>
      <div className={`fixed inset-0 z-[70] bg-navy transition-transform duration-500 lg:hidden ${open ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!open}>
        <div className="page-shell flex h-[76px] items-center justify-between"><Logo inverse /><button className="icon-button border-white/20 text-white" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div>
        <nav className="page-shell flex flex-col gap-2 pt-16">
          {nav.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-white/15 py-5 font-display text-5xl text-white"><span className="mr-4 font-mono text-xs text-lime">0{index + 1}</span>{item.label}</Link>)}
        </nav>
      </div>
    </>
  );
}
