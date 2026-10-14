import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WAITLIST_FILE = path.join(process.cwd(), "data", "waitlist.json");

type WaitlistEntry = {
  email: string;
  exam: string;
  timestamp: string;
  source: string;
};

async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const raw = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeWaitlist(entries: WaitlistEntry[]): Promise<void> {
  const dir = path.dirname(WAITLIST_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, exam, source } = body;

    // Validate email
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // Validate exam
    const validExams = ["cuet-ug", "iiser-iat", "niser-nest", "comedk", "all"];
    if (!exam || !validExams.includes(exam)) {
      return NextResponse.json(
        { error: "Please select a valid exam." },
        { status: 400 },
      );
    }

    const entries = await readWaitlist();

    // Check for duplicate email + exam
    const exists = entries.some(
      (e) => e.email.toLowerCase() === email.trim().toLowerCase() && e.exam === exam,
    );

    if (exists) {
      return NextResponse.json(
        { message: "You're already on the waitlist! We'll notify you when enrollment opens.", alreadyExists: true },
        { status: 200 },
      );
    }

    // Add new entry
    entries.push({
      email: email.trim().toLowerCase(),
      exam,
      timestamp: new Date().toISOString(),
      source: source || "waitlist-form",
    });

    await writeWaitlist(entries);

    return NextResponse.json(
      { message: "You're on the list! We'll email you when enrollment opens.", success: true },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Simple count endpoint for display purposes (no PII)
  try {
    const entries = await readWaitlist();
    return NextResponse.json({ count: entries.length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
