import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../db/client.ts";
import { sessionsTable, usersTable } from "../db/schema.ts";
import { newSessionToken, normalizeEmail, tokenHash } from "./security.ts";

export const STUDENT_COOKIE = "testdisha_student_session";
export const STUDENT_SESSION_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type StudentProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  provider: string;
  isGuest?: boolean;
};

export function getGoogleOAuthUrl(origin: string, state = "student_auth") {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    // Local dev mock callback when credentials are not configured
    return `${redirectUri}?mock=true&state=${encodeURIComponent(state)}`;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth client not configured.");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Failed to exchange token with Google: ${errText}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string; id_token: string };

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error("Failed to fetch Google user profile.");
  }

  const userData = (await userRes.json()) as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  };

  return {
    providerId: userData.sub,
    email: normalizeEmail(userData.email),
    name: userData.name || userData.email.split("@")[0],
    avatarUrl: userData.picture || null,
  };
}

export async function createStudentSession(profile: {
  email: string;
  name: string;
  provider?: string;
  providerId?: string;
  avatarUrl?: string | null;
  isGuest?: boolean;
}): Promise<{ student: StudentProfile; token: string }> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + STUDENT_SESSION_SECONDS * 1000);
  const cookieStore = await cookies();

  if (db) {
    const email = normalizeEmail(profile.email);
    // Find or create student user
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      const [inserted] = await db
        .insert(usersTable)
        .values({
          email,
          name: profile.name,
          provider: profile.provider || (profile.isGuest ? "guest" : "google"),
          providerId: profile.providerId || null,
          avatarUrl: profile.avatarUrl || null,
          role: "student",
          active: true,
        })
        .returning();
      user = inserted;
    } else {
      // Update avatar or provider info if provided
      if (profile.avatarUrl || profile.providerId) {
        await db
          .update(usersTable)
          .set({
            name: profile.name || user.name,
            avatarUrl: profile.avatarUrl || user.avatarUrl,
            providerId: profile.providerId || user.providerId,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, user.id));
      }
    }

    await db.insert(sessionsTable).values({
      userId: user.id,
      tokenHash: tokenHash(token),
      expiresAt,
    });

    cookieStore.set(STUDENT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: STUDENT_SESSION_SECONDS,
      path: "/",
    });

    return {
      student: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        isGuest: user.provider === "guest",
      },
      token,
    };
  }

  // Fallback when DB is not configured (Guest / Dev Demo mode)
  const mockId = "guest-" + token.slice(0, 12);
  const fallbackStudent: StudentProfile = {
    id: mockId,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl || null,
    provider: profile.provider || "guest",
    isGuest: true,
  };

  cookieStore.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STUDENT_SESSION_SECONDS,
    path: "/",
  });

  return { student: fallbackStudent, token };
}

export async function currentStudent(): Promise<StudentProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;

  if (db) {
    const [entry] = await db
      .select({
        sessionId: sessionsTable.id,
        expiresAt: sessionsTable.expiresAt,
        userId: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
        provider: usersTable.provider,
        role: usersTable.role,
        active: usersTable.active,
      })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
      .where(
        and(
          eq(sessionsTable.tokenHash, tokenHash(token)),
          gt(sessionsTable.expiresAt, new Date()),
          isNull(sessionsTable.revokedAt),
          eq(usersTable.active, true),
        ),
      )
      .limit(1);

    if (!entry) return null;

    return {
      id: entry.userId,
      email: entry.email,
      name: entry.name,
      avatarUrl: entry.avatarUrl,
      provider: entry.provider,
      isGuest: entry.provider === "guest",
    };
  }

  // DB unavailable fallback session check
  return {
    id: "guest-" + token.slice(0, 12),
    email: "student@testdisha.demo",
    name: "Demo Aspirant",
    avatarUrl: null,
    provider: "guest",
    isGuest: true,
  };
}

export async function logoutStudent() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE)?.value;
  if (token && db) {
    try {
      await db
        .update(sessionsTable)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(sessionsTable.tokenHash, tokenHash(token)),
            isNull(sessionsTable.revokedAt),
          ),
        );
    } catch {
      // Ignore DB error during logout
    }
  }

  cookieStore.delete(STUDENT_COOKIE);
}
