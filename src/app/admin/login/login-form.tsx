"use client";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { requestError } from "@/lib/request-error";
export function LoginForm() {
  const router = useRouter();
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok)
        throw new Error(
          requestError(
            await response.json().catch(() => null),
            "Unable to sign in. Please try again.",
          ),
        );
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error && error.name === "Error"
          ? error.message
          : "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-8 space-y-4" aria-busy={loading}>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Email address</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          maxLength={254}
          className="w-full rounded-2xl border border-navy/30 bg-white px-4 py-3.5 text-base"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Admin password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-describedby={error ? "login-error" : undefined}
          className="w-full rounded-2xl border border-navy/30 bg-white px-4 py-3.5 text-base"
        />
      </label>
      {error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <button
        disabled={loading}
        className="button-primary w-full disabled:opacity-60"
      >
        <LockKeyhole size={17} />
        {loading ? "Signing in…" : "Open admin panel"}
      </button>
    </form>
  );
}
