import "server-only";
import { getEnv } from "@/lib/env";

type CachedToken = { token: string; expiresAt: number } | null;
let cached: CachedToken = null;

/**
 * Exchange the OAuth refresh token for a short-lived access token.
 * The access token is cached in memory until 60 seconds before expiry.
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt > now + 60_000) {
    return cached.token;
  }

  const env = getEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_ADS_CLIENT_ID,
      client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    if (data.error === "invalid_grant") {
      throw new Error(
        "Google sign-in token has expired or been revoked (invalid_grant). Generate a new refresh token. Note: OAuth consent apps in Testing status expire refresh tokens after 7 days."
      );
    }
    if (data.error === "invalid_client") {
      throw new Error(
        "Google OAuth client credentials were rejected (invalid_client). Check GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET."
      );
    }
    throw new Error(`Could not obtain a Google access token (${data.error ?? `HTTP ${res.status}`}).`);
  }

  cached = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return cached.token;
}

/** Used by tests / health flow; not exported secrets. */
export function clearTokenCache(): void {
  cached = null;
}
