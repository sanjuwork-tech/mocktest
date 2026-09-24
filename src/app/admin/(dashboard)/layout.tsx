import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
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
  if (!(await isAdmin())) redirect("/admin/login");
  return children;
}
