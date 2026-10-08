import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSessionPayload, signSession, verifySession } from "@/lib/auth/session";

const SECRET_A = "a".repeat(32);
const SECRET_B = "b".repeat(32);

beforeEach(() => {
  process.env.SESSION_SECRET = SECRET_A;
});

afterEach(() => {
  delete process.env.SESSION_SECRET;
});

describe("session cookie signing and verification", () => {
  it("signs and verifies a password session (empty profile)", () => {
    const signed = signSession();
    expect(verifySession(signed)).toBe(true);
    const payload = getSessionPayload(signed);
    expect(payload?.email).toBeUndefined();
    expect(payload?.name).toBeUndefined();
  });

  it("stores and returns email, name and picture for Google sessions", () => {
    const signed = signSession({
      email: "user@example.com",
      name: "User",
      picture: "https://lh3.googleusercontent.com/pic.jpg",
    });
    expect(verifySession(signed)).toBe(true);
    const payload = getSessionPayload(signed);
    expect(payload?.email).toBe("user@example.com");
    expect(payload?.name).toBe("User");
    expect(payload?.picture).toBe("https://lh3.googleusercontent.com/pic.jpg");
  });

  it("rejects a tampered payload", () => {
    const signed = signSession({ email: "user@example.com" });
    const [encoded] = signed.split(".");
    expect(verifySession(`${encoded}.deadbeef`)).toBe(false);
    expect(verifySession(`${encoded}12345678`)).toBe(false);
  });

  it("rejects an expired payload with a valid signature", () => {
    const payload = Buffer.from(
      JSON.stringify({ email: "user@example.com", expiry: Date.now() - 1000 })
    ).toString("base64url");
    const sig = createHmac("sha256", SECRET_A).update(payload).digest("hex");
    expect(verifySession(`${payload}.${sig}`)).toBe(false);
  });

  it("rejects a session signed with a different secret", () => {
    const signed = signSession();
    process.env.SESSION_SECRET = SECRET_B;
    expect(verifySession(signed)).toBe(false);
  });

  it("rejects missing, malformed values and short secrets", () => {
    expect(verifySession(undefined)).toBe(false);
    expect(verifySession("")).toBe(false);
    expect(verifySession("garbage")).toBe(false);
    expect(verifySession("1234567890")).toBe(false);
    expect(verifySession("not-base64.abcdef")).toBe(false);
    process.env.SESSION_SECRET = "short";
    expect(verifySession(signSession())).toBe(false);
  });
});
