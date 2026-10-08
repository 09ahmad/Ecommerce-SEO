import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { GOOGLE_OAUTH_STATE_COOKIE, GOOGLE_OAUTH_VERIFIER_COOKIE } from "@/lib/auth/google";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  for (const name of [SESSION_COOKIE, GOOGLE_OAUTH_STATE_COOKIE, GOOGLE_OAUTH_VERIFIER_COOKIE]) {
    res.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
  return res;
}
