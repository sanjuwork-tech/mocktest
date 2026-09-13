import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/data/catalog";

export function TestCard({ product }: { product: Product }) {
  return (
    <article className="group rounded-[24px] border border-navy/10 bg-white/70 p-4 transition duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_24px_70px_rgba(7,26,77,.12)]">
      <div className="exam-dots relative flex h-[190px] flex-col justify-between overflow-hidden rounded-[18px] p-5" style={{ backgroundColor: product.color, color: product.color === "#B8FF34" ? "#071A4D" : "white" }}>
        <div className="flex items-start justify-between"><span className="font-mono text-[10px] font-medium uppercase tracking-[.12em]">{product.shortName} · 2026</span><span className="grid size-14 place-items-center rounded-full border border-current/50 text-center font-mono text-[9px] leading-tight">{product.mocks}<br />mocks</span></div>
        <h3 className="relative z-10 max-w-[230px] font-display text-[31px] leading-[.95] tracking-tight">{product.subtitle}</h3>
        <div className="absolute -bottom-20 -right-14 size-44 rounded-full border-[28px] border-white/15" />
      </div>
      <div className="px-2 pb-2 pt-5">
        <div className="mb-3 flex items-center justify-between"><span className="rounded-md bg-mist px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider">{product.pattern}</span><span className="text-xs font-bold">★ 4.9</span></div>
        <h2 className="text-lg font-extrabold tracking-tight">{product.title}</h2>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-navy/55">{product.features.slice(0, 3).map(feature => <span key={feature} className="inline-flex items-center gap-1"><Check size={12} className="text-blue" />{feature}</span>)}</div>
        <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-4"><div><strong className="font-display text-2xl">₹{product.price.toLocaleString("en-IN")}</strong><s className="ml-2 text-[10px] text-navy/40">₹{product.compareAtPrice.toLocaleString("en-IN")}</s></div><Link href={`/exams/${product.slug}`} className="grid size-11 place-items-center rounded-full bg-navy text-white transition group-hover:rotate-45 group-hover:bg-blue" aria-label={`View ${product.title}`}><ArrowUpRight size={18} /></Link></div>
      </div>
    </article>
  );
}
