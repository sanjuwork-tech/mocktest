import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return <main className="grid min-h-[72vh] place-items-center px-4 py-20"><div className="w-full max-w-md rounded-[28px] border border-navy/10 bg-white/80 p-7 shadow-[0_30px_90px_rgba(7,26,77,.12)] sm:p-9"><Image src="/logo-mark.svg" alt="" width={52} height={52} /><p className="eyebrow mt-7">Secure workspace</p><h1 className="font-display text-5xl font-semibold tracking-[-.05em]">Admin sign in</h1><p className="mt-3 text-sm leading-6 text-navy/50">Manage test-series inventory, publishing status, pricing, and order operations.</p><LoginForm /><p className="mt-5 text-center font-mono text-[9px] uppercase tracking-wider text-navy/35">Configure ADMIN_PASSWORD and AUTH_SECRET in Vercel</p></div></main>;
}
