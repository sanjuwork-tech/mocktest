import { Suspense } from "react";
import { StudentAuthForm } from "@/components/student/auth-form";
import { guestLoginEnabled } from "@/server/guest";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <StudentAuthForm guestEnabled={guestLoginEnabled()} />
    </Suspense>
  );
}
