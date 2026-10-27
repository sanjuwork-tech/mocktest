import { Suspense } from "react";
import { StartResolver } from "@/components/student/test-intro";

export default function Page() {
  return (
    <Suspense>
      <StartResolver />
    </Suspense>
  );
}
