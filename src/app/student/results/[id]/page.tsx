import { StudentResults } from "@/components/student/results";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentResults id={id} />;
}
