import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { currentAdmin } from "@/server/auth";
import { reviewPaper } from "@/server/reviews";
import { ReviewScreen } from "./review-screen";
import "../review.css";

export default async function PaperReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ rev?: string | string[]; q?: string | string[] }>;
}) {
  const me = await currentAdmin();
  if (!me) redirect("/admin/login");
  const { testId } = await params;
  if (!z.uuid().safeParse(testId).success) notFound();
  const paper = await reviewPaper(testId, { publishedOnly: me.role === "reviewer" });
  if (!paper) notFound();

  // Open at ?rev=<revision> (links from the issue list) or ?q=<number>, else the first question this reviewer hasn't answered.
  const { rev, q } = await searchParams;
  const byRev = paper.questions.findIndex((x) => x.revisionId === rev);
  const byNumber = Number(q) - 1;
  const firstOpen = paper.questions.findIndex((x) => !x.reviews.some((r) => r.reviewerId === me.userId));
  const start =
    byRev >= 0 ? byRev : byNumber >= 0 && byNumber < paper.questions.length ? byNumber : Math.max(0, firstOpen);

  return <ReviewScreen paper={paper} meId={me.userId} canReview={me.role !== "editor"} start={start} />;
}
