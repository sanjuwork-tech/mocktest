"use client";

import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password") }) });
    if (!response.ok) { const data = await response.json(); setError(data.error ?? "Unable to sign in"); setLoading(false); return; }
    router.push("/admin"); router.refresh();
  }
  return <form onSubmit={submit} className="mt-8 space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold">Admin password</span><input name="password" type="password" required autoComplete="current-password" className="w-full rounded-2xl border border-navy/15 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-blue focus:ring-4 focus:ring-blue/10" placeholder="Enter your password" /></label>{error && <p className="rounded-xl bg-coral/10 p-3 text-xs font-semibold text-coral">{error}</p>}<button disabled={loading} className="button-primary w-full bg-blue disabled:opacity-50"><LockKeyhole size={15} />{loading ? "Signing in…" : "Open admin panel"}</button></form>;
}
