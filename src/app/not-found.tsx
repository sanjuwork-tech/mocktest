import Link from "next/link";

export default function NotFound() { return <main className="grid min-h-[62vh] place-items-center px-5 text-center"><div><span className="font-mono text-xs text-blue">404 / NO QUESTION FOUND</span><h1 className="mt-4 font-display text-7xl font-semibold tracking-[-.06em]">This page skipped itself.</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-navy/50">Return to the test library and choose a live series.</p><Link href="/test-series" className="button-primary mt-7 bg-blue">Browse test series</Link></div></main>; }
