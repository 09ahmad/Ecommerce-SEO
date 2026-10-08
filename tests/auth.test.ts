import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTokenCache, getAccessToken } from "@/lib/google-ads/auth";
import { getEnv } from "@/lib/env";

function setEnv() {
  process.env.GOOGLE_ADS_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_ADS_CLIENT_SECRET = "test-client-secret";
  process.env.GOOGLE_ADS_REFRESH_TOKEN = "test-refresh-token";
  process.env.GOOGLE_ADS_CUSTOMER_ID = "123-456-7890";
  process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID = "987 654 3210";
  process.env.GOOGLE_ADS_API_VERSION = "v25";
  process.env.APP_PASSWORD = "app-password";
  process.env.SESSION_SECRET = "s".repeat(32);
  delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
}

beforeEach(() => {
  setEnv();
  clearTokenCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getEnv", () => {
  it("throws naming the missing variable, never its value", () => {
    delete process.env.GOOGLE_ADS_CLIENT_ID;
    delete process.env.SESSION_SECRET;
    process.env.GOOGLE_ADS_CUSTOMER_ID = "abc";
    try {
      getEnv();
      expect.unreachable("expected getEnv to throw");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      expect(msg).toMatch(/GOOGLE_ADS_CLIENT_ID/);
      expect(msg).toMatch(/SESSION_SECRET/);
      expect(msg).toMatch(/GOOGLE_ADS_CUSTOMER_ID/);
      expect(msg).not.toContain("test-refresh-token");
    }
  });

  it("strips dashes and whitespace from customer IDs", () => {
    const env = getEnv();
    expect(env.GOOGLE_ADS_CUSTOMER_ID).toBe("1234567890");
    expect(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID).toBe("9876543210");
  });
});

describe("getAccessToken", () => {
  it("reports invalid_grant with the 7-day testing-status hint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ error: "invalid_grant", error_description: "Token has been expired or revoked." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      )
    );
    await expect(getAccessToken()).rejects.toThrow(/invalid_grant/);
    await expect(getAccessToken()).rejects.toThrow(/7 days/);
  });

  it("reports invalid_client naming the variables", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "invalid_client" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    await expect(getAccessToken()).rejects.toThrow(/GOOGLE_ADS_CLIENT_ID/);
  });

  it("exchanges the refresh token and caches the access token", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ access_token: "at-123", expires_in: 3600 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    expect(await getAccessToken()).toBe("at-123");
    expect(await getAccessToken()).toBe("at-123");
    expect(fetchMock.mock.calls.length).toBe(1);
  });

  it("posts the OAuth fields to the token endpoint", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ access_token: "at", expires_in: 3600 }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    await getAccessToken();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    const body = new URLSearchParams(String(init.body));
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("client_id")).toBe("test-client-id");
  });
});
