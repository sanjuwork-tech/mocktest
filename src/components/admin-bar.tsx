"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";

/** Top bar for every signed-in admin page; the public header and footer are hidden there. */
export function AdminBar() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST", signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error();
      router.push("/admin/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="admin-bar">
      <Link href="/admin" className="admin-bar-brand">
        <Image src="/logo.svg" alt="OurMocks" width={133} height={28} />
        <span>Admin</span>
      </Link>
      <nav aria-label="Admin">
        <Link href="/admin">
          <LayoutDashboard size={16} aria-hidden="true" /> Dashboard
        </Link>
        <a href="/" target="_blank" rel="noopener">
          <ExternalLink size={16} aria-hidden="true" /> View site
        </a>
        <button type="button" onClick={signOut} disabled={signingOut}>
          <LogOut size={16} aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </nav>
      {error && (
        <p role="alert" className="admin-bar-error">
          {error}
        </p>
      )}
    </div>
  );
}
