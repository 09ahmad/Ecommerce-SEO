import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getGoogleOAuthEnv } from "@/lib/env";

export const GOOGLE_OAUTH_STATE_COOKIE = "ckl_oauth_state";
export const GOOGLE_OAUTH_VERIFIER_COOKIE = "ckl_oauth_verifier";
export const OAUTH_STATE_TTL_SECONDS = 10 * 60; // 10 minutes
export const GOOGLE_AUTH_SCOPES = "openid email profile";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export function createState(): string {
  return randomBytes(16).toString("hex");
}

export function createCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Parse the ALLOWED_EMAILS env value: comma-separated, case-insensitive. */
export function allowedEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string, raw: string | undefined): boolean {
  return allowedEmails(raw).includes(email.trim().toLowerCase());
}

/** Authorization URL for the sign-in flow (openid email profile only, PKCE S256). */
export function buildAuthorizationUrl(state: string, challenge: string): string {
  const env = getGoogleOAuthEnv();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_ADS_CLIENT_ID,
    redirect_uri: `${env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: GOOGLE_AUTH_SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleProfile {
  email: string;
  name?: string;
  picture?: string;
}

interface IdTokenPayload {
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export function parseIdToken(idToken: string): IdTokenPayload | null {
  const parts = idToken.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as IdTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Exchange the authorization code for the user's profile.
 * The id_token comes directly from Google's token endpoint over HTTPS,
 * so its signature is not re-verified here (confidential client).
 */
export async function exchangeGoogleCode(
  code: string,
  verifier: string
): Promise<GoogleProfile> {
  const env = getGoogleOAuthEnv();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_ADS_CLIENT_ID,
      client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
      redirect_uri: `${env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as {
    id_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.id_token) {
    throw new Error(`Google sign-in failed (${data.error ?? `HTTP ${res.status}`}).`);
  }

  const payload = parseIdToken(data.id_token);
  if (!payload?.email) {
    throw new Error("Google did not return an email address for this account.");
  }
  return { email: payload.email, name: payload.name, picture: payload.picture };
}
