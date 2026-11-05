import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/auth";
import { AdminBar } from "@/components/admin-bar";
import { ReviewerOnly } from "./review/reviewer-only";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="admin-shell">
      <AdminBar role={admin.role} />
      {/* Reviewers (external experts) only review; every other admin page sends them to /admin/review. */}
      {admin.role === "reviewer" ? <ReviewerOnly>{children}</ReviewerOnly> : children}
    </div>
  );
}
