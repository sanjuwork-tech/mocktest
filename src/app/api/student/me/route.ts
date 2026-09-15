import { NextResponse } from "next/server";
import { currentStudent } from "@/server/student-auth";

export async function GET() {
  const student = await currentStudent();
  return NextResponse.json({ student });
}
