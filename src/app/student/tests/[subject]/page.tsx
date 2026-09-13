import { notFound } from "next/navigation";
import { TestPlayer } from "@/components/student/test-player";
import { SUBJECTS } from "@/lib/student/model";
export default async function Page({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const s = SUBJECTS.find((s) => s.id === subject);
  if (!s) notFound();
  return <TestPlayer subject={s.id} />;
}
