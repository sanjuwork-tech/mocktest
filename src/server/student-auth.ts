import "server-only";
import { eq } from "drizzle-orm";
import { requireDb } from "../db/client.ts";
import { usersTable } from "../db/schema.ts";
import { startStudentSession } from "./auth.ts";
import { normalizeEmail } from "./security.ts";

export const OAUTH_STATE_COOKIE = "ourmocks_oauth_state";

// The mock Google login exists only for local development without OAuth credentials.
export function mockGoogleLoginAllowed() {
  return (
    process.env.NODE_ENV !== "production" &&
    (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
  );
}

export function getGoogleOAuthUrl(origin: string, state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    if (!mockGoogleLoginAllowed()) {
      throw new Error("Google OAuth client not configured.");
    }
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
    console.error("Google token exchange failed", tokenRes.status);
    throw new Error("Failed to exchange token with Google.");
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

/** Signs a Google-verified student in, creating the account on first use. */
export async function createStudentSession(profile: {
  email: string;
  name: string;
  provider: string;
  providerId?: string;
  avatarUrl?: string | null;
}) {
  const db = requireDb();
  const email = normalizeEmail(profile.email);
  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (user && user.role !== "student") {
    // Staff accounts sign in through the admin login only.
    throw new Error("This account cannot use student sign-in.");
  }

  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({
        email,
        name: profile.name,
        provider: profile.provider,
        providerId: profile.providerId ?? null,
        avatarUrl: profile.avatarUrl ?? null,
        role: "student",
        active: true,
      })
      .returning();
  } else if (profile.avatarUrl || profile.providerId) {
    await db
      .update(usersTable)
      .set({
        avatarUrl: profile.avatarUrl ?? user.avatarUrl,
        providerId: profile.providerId ?? user.providerId,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));
  }

  if (!user.active) throw new Error("This account is disabled.");
  await startStudentSession(user.id);
  return user;
}
