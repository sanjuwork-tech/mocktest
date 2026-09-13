import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy py-16 text-white">
      <div className="page-shell">
        <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div><Logo inverse /><p className="mt-5 max-w-sm text-sm leading-7 text-white/50">Real exam pressure. Useful analytics. Smarter revision for India&apos;s ambitious entrance-exam students.</p></div>
          <FooterGroup title="Exams" links={[["CUET UG", "/exams/cuet-ug"], ["IISER IAT", "/exams/iiser-iat"], ["NISER NEST", "/exams/niser-nest"], ["COMEDK", "/exams/comedk"]]} />
          <FooterGroup title="Explore" links={[["All test series", "/test-series"], ["Student results", "/results"], ["About MockStride", "/about"], ["Admin", "/admin"]]} />
          <FooterGroup title="Support" links={[["Contact", "mailto:hello@mockstride.com"], ["Privacy", "/about#privacy"], ["Terms", "/about#terms"], ["Refunds", "/about#refunds"]]} />
        </div>
        <div className="flex flex-col gap-2 pt-7 font-mono text-[10px] uppercase tracking-[.12em] text-white/35 sm:flex-row sm:justify-between"><span>© 2026 MockStride</span><span>Designed for focused preparation</span></div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return <div><h3 className="mb-5 font-mono text-[10px] uppercase tracking-[.14em] text-lime">{title}</h3>{links.map(([label, href]) => <Link key={label} href={href} className="mb-3 block text-sm text-white/60 transition hover:text-white">{label}</Link>)}</div>;
}
