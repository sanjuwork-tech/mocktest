import type { Metadata } from "next";
import { ArrowRight, BarChart3, Check, Clock3, FileCheck2, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { productBySlug, products, siteConfig } from "@/data/catalog";

export const dynamicParams = false;
export function generateStaticParams() { return products.map(product => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  return { title: product.title, description: product.description, keywords: product.keywords, alternates: { canonical: `/exams/${product.slug}` }, openGraph: { title: product.title, description: product.description, url: `/exams/${product.slug}` } };
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.title, description: product.description, brand: { "@type": "Brand", name: siteConfig.name }, offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: "https://schema.org/InStock", url: `${siteConfig.url}/exams/${product.slug}` }, aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: product.students.replace(/\D/g, "") || "100" } };
  return <main>
    <section className="overflow-hidden pb-20 pt-16"><div className="page-shell grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]"><Reveal><p className="eyebrow">{product.shortName} · 2026</p><h1 className="font-display text-[clamp(4rem,8vw,7.5rem)] font-semibold leading-[.83] tracking-[-.07em]">{product.title}</h1><p className="mt-7 max-w-xl text-base leading-8 text-navy/58">{product.description}</p><div className="mt-8 flex flex-wrap items-center gap-4"><button className="button-primary bg-blue">Buy for ₹{product.price.toLocaleString("en-IN")} <ArrowRight size={15} /></button><span className="font-mono text-[10px] text-navy/45">Access through exam day</span></div></Reveal><Reveal delay={.12}><div className="exam-dots relative mx-auto aspect-square max-w-[470px] overflow-hidden rounded-[38px] p-9 shadow-[18px_20px_0_#071A4D]" style={{ backgroundColor: product.color, color: product.color === "#B8FF34" ? "#071A4D" : "white" }}><span className="font-mono text-[10px] uppercase tracking-[.14em]">MockStride original series</span><div className="absolute inset-x-9 bottom-9"><strong className="block font-display text-[7rem] leading-none tracking-[-.08em]">{product.mocks}</strong><span className="text-sm font-extrabold uppercase">full-length mocks</span><div className="mt-6 flex items-center justify-between border-t border-current/25 pt-5 text-xs"><span>{product.pattern}</span><Trophy size={22} /></div></div></div></Reveal></div></section>
    <section className="bg-navy py-20 text-white"><div className="page-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[<FileCheck2 key="i" />, `${product.mocks} mocks`, "Latest official pattern"], [<Clock3 key="i" />, "Real timer", "Exam-like pressure"], [<BarChart3 key="i" />, "Deep reports", "Concept and speed analysis"], [<Trophy key="i" />, "Live rank", "Nationwide benchmark"]].map(([icon, title, copy]) => <div key={String(title)} className="rounded-2xl border border-white/15 p-6"><span className="text-lime">{icon}</span><h2 className="mt-12 text-lg font-extrabold">{title}</h2><p className="mt-2 text-xs text-white/50">{copy}</p></div>)}</div></section>
    <section className="section-space"><div className="page-shell grid gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><p className="eyebrow">What you get</p><h2 className="section-title">Built around your score, not screen time.</h2></div><div className="divide-y divide-navy/12 border-y border-navy/12">{product.features.concat(["Detailed mistake notebook", "Unlimited re-analysis"]).map(feature => <div key={feature} className="flex items-center gap-4 py-5 text-sm font-bold"><span className="grid size-8 place-items-center rounded-full bg-lime"><Check size={15} /></span>{feature}</div>)}</div></div></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  </main>;
}
