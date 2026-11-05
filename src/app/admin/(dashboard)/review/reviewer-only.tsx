"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/** Layouts cannot read the path on the server, so the reviewer redirect happens here; the APIs enforce the same rule. */
export function ReviewerOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const allowed = pathname === "/admin/review" || pathname.startsWith("/admin/review/");
  useEffect(() => {
    if (!allowed) router.replace("/admin/review");
  }, [allowed, router]);
  if (!allowed)
    return (
      <p role="status" className="page-shell py-12">
        Opening expert review…
      </p>
    );
  return children;
}
