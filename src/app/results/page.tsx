import type { Metadata } from "next";
import { ArrowUpRight, Clock3, Goal, TrendingUp } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "Student Results & Mock-Test Outcomes", description: "See how MockStride students improve accuracy, speed, percentile, and entrance-exam confidence through structured mock-test practice.", keywords: ["mock test results", "exam rank improvement", "CUET mock test scores", "IAT rank predictor"], alternates: { canonical: "/results" } };

const stories = [
  { initials: "AR", name: "Aarav Rao", exam: "IISER IAT", result: "AIR 391", change: "+21 marks", color: "bg-blue text-white" },
  { initials: "SK", name: "Siya Kapoor", exam: "CUET UG", result: "99.2 %ile", change: "+16% accuracy", color: "bg-lime" },
  { initials: "VN", name: "Ved Nair", exam: "COMEDK", result: "Rank 1,284", change: "−18s / question", color: "bg-coral text-white" },
];

export default function ResultsPage() {
  return <main><PageHero eyebrow="Student outcomes" title="Progress you can measure." copy="Mock scores matter only when they show you what to do next. These are the improvement signals our students follow." />
    <section className="section-space"><div className="page-shell grid gap-5 md:grid-cols-3">{stories.map((story, index) => <Reveal key={story.name} delay={index * .08}><article className={`min-h-[370px] rounded-[28px] p-7 ${story.color}`}><div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-full border border-current font-mono text-xs">{story.initials}</span><ArrowUpRight /></div><p className="mt-20 font-mono text-[10px] uppercase tracking-[.14em] opacity-60">{story.exam}</p><strong className="mt-3 block font-display text-6xl tracking-[-.06em]">{story.result}</strong><h2 className="mt-5 text-lg font-extrabold">{story.name}</h2><p className="mt-2 text-xs opacity-60">Average improvement: {story.change}</p></article></Reveal>)}</div></section>
    <section className="bg-navy py-24 text-white"><div className="page-shell"><div className="grid gap-4 md:grid-cols-3">{[[<TrendingUp key="i" />, "18%", "median accuracy gain"], [<Clock3 key="i" />, "14s", "faster per question"], [<Goal key="i" />, "6.2k", "active aspirants"]].map(([icon, value, label]) => <div key={String(label)} className="rounded-3xl border border-white/15 p-8"><span className="text-lime">{icon}</span><strong className="mt-16 block font-display text-7xl">{value}</strong><span className="text-xs text-white/50">{label}</span></div>)}</div><p className="mt-6 font-mono text-[9px] uppercase tracking-wider text-white/30">Illustrative aggregate figures for the prototype. Connect production analytics before publishing claims.</p></div></section>
  </main>;
}
