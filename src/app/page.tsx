import { ArrowDown, ArrowRight, BarChart3, Clock3, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { ExamOrbit } from "@/components/exam-orbit";
import { Reveal } from "@/components/reveal";
import { TestCard } from "@/components/test-card";
import { products } from "@/data/catalog";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main>
      <section className="overflow-hidden pb-16 pt-14 sm:pt-20 lg:pb-24">
        <div className="page-shell grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <Reveal>
            <p className="eyebrow">Built for serious aspirants</p>
            <h1 className="max-w-[760px] font-display text-[clamp(4.2rem,8.6vw,8.2rem)] font-semibold leading-[.83] tracking-[-.075em]">Practice like it&apos;s <em className="font-medium text-blue">exam day.</em></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-navy/58">High-fidelity mock tests for CUET UG, IISER IAT, NISER NEST, and COMEDK—calibrated by exam experts and explained question by question.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/test-series" className="button-primary bg-blue">Explore test series <ArrowDown size={15} /></Link><Link href="/results" className="button-secondary">See student outcomes <ArrowRight size={15} /></Link></div>
            <div className="mt-9 flex flex-wrap items-center gap-5 text-xs font-bold"><span className="text-amber-500">★★★★★</span><span>4.9 from 6,200+ students</span><span className="h-4 w-px bg-navy/15" /><span className="font-mono text-[10px] text-navy/45">2026 PATTERN READY</span></div>
          </Reveal>
          <Reveal delay={.12}><ExamOrbit /></Reveal>
        </div>
      </section>

      <div className="overflow-hidden border-y border-navy bg-blue py-4 text-white"><div className="marquee flex"><Ticker /><Ticker /></div></div>

      <section className="section-space" id="series">
        <div className="page-shell">
          <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Pick your exam</p><h2 className="section-title">One clear path to a stronger score.</h2></div><Link href="/test-series" className="button-secondary self-start md:self-auto">View all test series <ArrowRight size={15} /></Link></Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{products.slice(0, 3).map((product, index) => <Reveal key={product.id} delay={index * .08}><TestCard product={product} /></Reveal>)}</div>
        </div>
      </section>

      <section className="bg-navy py-24 text-white sm:py-32">
        <div className="page-shell">
          <Reveal className="mb-12 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-end"><div><p className="eyebrow text-lime">Numbers, not noise</p><h2 className="section-title">Feedback you can act on before the next mock.</h2></div><p className="text-sm leading-7 text-white/50">Know the concepts, question types, and time sinks costing you marks—then get the right next action.</p></Reveal>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr_.8fr]">
            <Reveal><div className="relative min-h-[390px] overflow-hidden rounded-[28px] bg-lime p-8 text-navy"><span className="font-mono text-[10px] uppercase tracking-[.14em]">01 / Accuracy</span><span className="absolute right-7 top-7 rounded-full border border-navy px-3 py-2 font-mono text-[9px]">↑ 18% in 4 weeks</span><strong className="mt-20 block font-display text-8xl tracking-[-.07em]">82%</strong><h3 className="mt-5 text-lg font-extrabold">Concept-level accuracy</h3><p className="mt-2 max-w-sm text-xs leading-6 text-navy/60">See the exact chapters where easy marks are slipping.</p><Target className="absolute -bottom-10 -right-8 size-48 opacity-10" /></div></Reveal>
            <Reveal delay={.08}><MetricCard icon={<Clock3 />} label="02 / Speed" value="46s" title="Time intelligence" copy="Learn when to solve, skip, and return." color="bg-blue" /></Reveal>
            <Reveal delay={.16}><MetricCard icon={<BarChart3 />} label="03 / Rank" value="842" title="Live AIR prediction" copy="Benchmark against serious aspirants nationwide." color="bg-white text-navy" /></Reveal>
          </div>
        </div>
      </section>

      <section className="section-space blueprint-grid">
        <div className="page-shell">
          <Reveal className="mb-12"><p className="eyebrow">The improvement loop</p><h2 className="section-title">Attempt. Analyse. Improve. Repeat.</h2></Reveal>
          <div className="grid border-l border-t border-navy/15 sm:grid-cols-2 lg:grid-cols-4">{[
            ["01", "Choose a mock", "Pick a full test or focused chapter drill aligned with your study plan."],
            ["02", "Enter exam mode", "Use the real timer, question palette, sections, and marking scheme."],
            ["03", "Read the diagnosis", "Get concept gaps, time sinks, accuracy trends, and rank context."],
            ["04", "Fix weak spots", "Review clear solutions and add misses to your mistake notebook."],
          ].map(([number, title, copy], index) => <Reveal key={number} delay={index * .07} className="min-h-[300px] border-b border-r border-navy/15 bg-paper/70 p-7 transition hover:bg-white"><span className={`grid size-10 place-items-center rounded-full font-mono text-[10px] ${index === 2 ? "bg-lime text-navy" : index === 1 ? "bg-blue text-white" : "bg-navy text-white"}`}>{number}</span><h3 className="mt-20 font-display text-3xl font-semibold tracking-tight">{title}</h3><p className="mt-3 text-xs leading-6 text-navy/55">{copy}</p></Reveal>)}</div>
        </div>
      </section>

      <section className="pb-20 pt-6 sm:pb-28">
        <div className="page-shell">
          <Reveal className="relative overflow-hidden rounded-[32px] bg-blue p-8 text-white sm:p-14 lg:p-16"><Sparkles className="absolute right-10 top-10 size-20 text-lime opacity-50" /><p className="max-w-4xl font-display text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-[-.05em]">“The mocks were slightly tougher than the real IAT—and that&apos;s exactly why exam day felt calm.”</p><div className="mt-10 flex items-center gap-4"><span className="grid size-12 place-items-center rounded-full bg-lime font-mono text-xs text-navy">AR</span><div><strong className="block text-sm">Aarav Rao · IISER Pune</strong><span className="text-[11px] text-white/55">AIR 391 · IAT 2025</span></div></div></Reveal>
        </div>
      </section>

      <section className="pb-12"><div className="page-shell"><Reveal className="flex flex-col items-start justify-between gap-8 rounded-[28px] border border-navy bg-lime p-8 shadow-[9px_9px_0_#071A4D] sm:p-12 lg:flex-row lg:items-center"><h2 className="max-w-3xl font-display text-[clamp(3rem,6vw,5.2rem)] font-semibold leading-[.9] tracking-[-.06em]">Your best score is still ahead.</h2><Link href="/test-series" className="button-primary shrink-0">Find your series <span>↗</span></Link></Reveal></div></section>
    </main>
  );
}

function Ticker() { return <div className="flex shrink-0">{["CUET UG", "IISER IAT", "NISER NEST", "COMEDK UGET", "Detailed analytics"].map(item => <span key={item} className="flex items-center gap-7 px-7 font-mono text-[11px] uppercase tracking-[.12em]">{item}<b className="text-lime">✦</b></span>)}</div>; }

function MetricCard({ icon, label, value, title, copy, color }: { icon: React.ReactNode; label: string; value: string; title: string; copy: string; color: string }) { return <div className={`relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/15 p-7 ${color}`}><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.14em]">{label}</span><span className="opacity-50">{icon}</span></div><strong className="mt-24 block font-display text-7xl tracking-[-.07em]">{value}</strong><h3 className="mt-5 text-base font-extrabold">{title}</h3><p className="mt-2 text-xs leading-6 opacity-55">{copy}</p></div>; }
