import type { Metadata } from "next";
import { BookOpenCheck, BrainCircuit, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "About Our Exam Mock-Test Platform", description: "Learn how MockStride builds realistic, expert-reviewed test series for CUET UG, IISER IAT, NISER NEST, and COMEDK.", keywords: ["about MockStride", "exam mock test platform India", "expert reviewed test series"], alternates: { canonical: "/about" } };

export default function AboutPage() {
  return <main><PageHero eyebrow="Why MockStride" title="Less content. Better practice." copy="We are building the focused exam-preparation platform we wanted as students: realistic papers, transparent analytics, and no noisy learning feed." />
    <section className="section-space"><div className="page-shell"><div className="grid gap-5 md:grid-cols-3">{[
      [<BookOpenCheck key="i" />, "Pattern fidelity", "Every paper is mapped to the current syllabus, marking scheme, section rules, and expected difficulty curve."],
      [<BrainCircuit key="i" />, "Useful diagnosis", "Reports translate attempts into concept gaps, time leaks, careless errors, and clear revision priorities."],
      [<ShieldCheck key="i" />, "Responsible practice", "No inflated rank promises. No fake urgency. Student data and payment flows are designed to stay protected."],
    ].map(([icon, title, copy], index) => <Reveal key={String(title)} delay={index * .08}><article className="min-h-[330px] rounded-[26px] border border-navy/12 bg-white/65 p-8"><span className="grid size-12 place-items-center rounded-2xl bg-mist text-blue">{icon}</span><h2 className="mt-20 font-display text-3xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-navy/55">{copy}</p></article></Reveal>)}</div></div></section>
    <section className="pb-24" id="privacy"><div className="page-shell grid gap-6 lg:grid-cols-2"><div className="rounded-[28px] bg-blue p-9 text-white"><p className="eyebrow text-lime">Academic standard</p><h2 className="font-display text-5xl font-semibold leading-none">Every question earns its place.</h2><p className="mt-6 text-sm leading-7 text-white/60">Questions pass subject review, ambiguity checks, solution review, and difficulty calibration before entering a test.</p></div><div className="rounded-[28px] bg-lime p-9"><p className="eyebrow">Built in India</p><h2 className="font-display text-5xl font-semibold leading-none">For the exams students actually take.</h2><p className="mt-6 text-sm leading-7 text-navy/60">Our roadmap stays centered on Indian university and science entrance exams, beginning with CUET, IAT, NEST, and COMEDK.</p></div></div></section>
  </main>;
}
