import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  allowedEmails,
  buildAuthorizationUrl,
  codeChallenge,
  createCodeVerifier,
  createState,
  exchangeGoogleCode,
  isEmailAllowed,
  parseIdToken,
} from "@/lib/auth/google";
import { createHash } from "node:crypto";

beforeEach(() => {
  process.env.GOOGLE_ADS_CLIENT_ID = "oauth-client-id";
  process.env.GOOGLE_ADS_CLIENT_SECRET = "oauth-client-secret";
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  process.env.ALLOWED_EMAILS = "Owner@Example.com, partner@example.com";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("state and PKCE helpers", () => {
  it("creates 32-char hex state values that are unique", () => {
    const a = createState();
    const b = createState();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(b).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
  });

  it("creates 43-char base64url code verifiers that are unique", () => {
    const a = createCodeVerifier();
    const b = createCodeVerifier();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(b).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a).not.toBe(b);
  });

  it("derives the S256 code challenge from the verifier", () => {
    const verifier = createCodeVerifier();
    expect(codeChallenge(verifier)).toBe(
      createHash("sha256").update(verifier).digest("base64url")
    );
    expect(codeChallenge(verifier)).not.toBe(verifier);
  });
});

describe("allowed emails", () => {
  it("parses a comma-separated list, trimming and lowercasing", () => {
    expect(allowedEmails(" Owner@Example.com , PARTNER@example.com ,, ")).toEqual([
      "owner@example.com",
      "partner@example.com",
    ]);
    expect(allowedEmails(undefined)).toEqual([]);
    expect(allowedEmails("")).toEqual([]);
  });

  it("checks membership case-insensitively", () => {
    expect(isEmailAllowed("owner@example.com", "Owner@Example.com")).toBe(true);
    expect(isEmailAllowed("  OWNER@EXAMPLE.COM  ", "owner@example.com")).toBe(true);
    expect(isEmailAllowed("stranger@example.com", "owner@example.com")).toBe(false);
    expect(isEmailAllowed("owner@example.com", undefined)).toBe(false);
  });
});

describe("parseIdToken", () => {
  it("decodes the payload of a three-part JWT", () => {
    const payload = Buffer.from(
      JSON.stringify({ email: "user@example.com", name: "User", picture: "https://x/p.png" })
    ).toString("base64url");
    const idToken = `header.${payload}.signature`;
    expect(parseIdToken(idToken)).toEqual({
      email: "user@example.com",
      name: "User",
      picture: "https://x/p.png",
    });
  });

  it("returns null for malformed tokens", () => {
    expect(parseIdToken("not-a-jwt")).toBeNull();
    expect(parseIdToken("a.b")).toBeNull();
    expect(parseIdToken("a.!!!.c")).toBeNull();
  });
});

describe("buildAuthorizationUrl", () => {
  it("targets the Google consent screen with openid email profile and PKCE", () => {
    const url = new URL(buildAuthorizationUrl("state-123", "challenge-456"));
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("oauth-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/google/callback"
    );
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("state")).toBe("state-123");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-456");
    expect(url.searchParams.get("scope")).not.toContain("adwords");
  });
});

describe("exchangeGoogleCode", () => {
  function makeIdToken(email: string): string {
    const payload = Buffer.from(JSON.stringify({ email, name: "User" })).toString("base64url");
    return `header.${payload}.signature`;
  }

  it("exchanges the code and returns the profile from the id_token", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ access_token: "at", id_token: makeIdToken("owner@example.com") }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const profile = await exchangeGoogleCode("code-1", "verifier-1");
    expect(profile.email).toBe("owner@example.com");
    expect(profile.name).toBe("User");

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    const body = new URLSearchParams(String(init.body));
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("code-1");
    expect(body.get("code_verifier")).toBe("verifier-1");
    expect(body.get("redirect_uri")).toBe("http://localhost:3000/api/auth/google/callback");
    expect(body.get("client_id")).toBe("oauth-client-id");
  });

  it("throws a friendly error when the exchange fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "invalid_grant" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    await expect(exchangeGoogleCode("bad", "bad")).rejects.toThrow(/Google sign-in failed/);
  });
});
