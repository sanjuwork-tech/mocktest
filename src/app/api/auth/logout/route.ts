import { NextResponse } from "next/server";
import { logoutStudent } from "@/server/student-auth";

export async function POST() {
  await logoutStudent();
  return NextResponse.json({ success: true });
}
