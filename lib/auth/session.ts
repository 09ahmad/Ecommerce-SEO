import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ckl_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionPayload {
  email?: string;
  name?: string;
  picture?: string;
  expiry: number; // epoch ms
}

export type SessionProfile = Pick<SessionPayload, "email" | "name" | "picture">;

function hmac(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function encode(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decode(encoded: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as Partial<SessionPayload>;
    if (typeof parsed.expiry !== "number" || !Number.isFinite(parsed.expiry)) return null;
    return {
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      picture: typeof parsed.picture === "string" ? parsed.picture : undefined,
      expiry: parsed.expiry,
    };
  } catch {
    return null;
  }
}

/**
 * Sign a session for a user. Profile fields are optional: the password flow
 * signs an empty profile, the Google flow stores email/name/picture.
 */
export function signSession(profile: SessionProfile = {}): string {
  const secret = process.env.SESSION_SECRET ?? "";
  const payload: SessionPayload = {
    ...profile,
    expiry: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encoded = encode(payload);
  return `${encoded}.${hmac(encoded, secret)}`;
}

/** Verify the HMAC and expiry; returns the payload or null. */
export function getSessionPayload(value: string | undefined): SessionPayload | null {
  const secret = process.env.SESSION_SECRET ?? "";
  if (!value || secret.length < 32) return null;
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;
  const encoded = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = hmac(encoded, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  const payload = decode(encoded);
  if (!payload) return null;
  return payload.expiry > Date.now() ? payload : null;
}

/** Boolean check used by the proxy. */
export function verifySession(value: string | undefined): boolean {
  return getSessionPayload(value) !== null;
}
