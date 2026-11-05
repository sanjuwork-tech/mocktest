import { redirect } from "next/navigation";
import { currentAdmin } from "@/server/auth";
import { openIssues, reviewPaperList } from "@/server/reviews";
import { ReviewList } from "./review-list";
import "./review.css";

export default async function ReviewPage() {
  const me = await currentAdmin();
  if (!me) redirect("/admin/login");
  let papers: Awaited<ReturnType<typeof reviewPaperList>> = [];
  let issues: Awaited<ReturnType<typeof openIssues>> = [];
  let failed = false;
  try {
    papers = await reviewPaperList(me.userId, { publishedOnly: me.role === "reviewer" });
    if (me.role !== "reviewer") issues = await openIssues();
  } catch {
    failed = true;
  }
  return <ReviewList papers={papers} issues={issues} role={me.role} name={me.name} failed={failed} />;
}
