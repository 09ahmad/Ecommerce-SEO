import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  codeChallenge,
  createCodeVerifier,
  createState,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
  OAUTH_STATE_TTL_SECONDS,
} from "@/lib/auth/google";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: OAUTH_STATE_TTL_SECONDS,
  path: "/",
};

export async function GET(request: NextRequest) {
  try {
    const state = createState();
    const verifier = createCodeVerifier();
    const url = buildAuthorizationUrl(state, codeChallenge(verifier));
    const res = NextResponse.redirect(url);
    res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, cookieOptions);
    res.cookies.set(GOOGLE_OAUTH_VERIFIER_COOKIE, verifier, cookieOptions);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }
}
