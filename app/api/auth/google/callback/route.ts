import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
  isEmailAllowed,
  safeEqual,
} from "@/lib/auth/google";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/auth/session";

function backToLogin(request: NextRequest, code: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  if (q.get("error")) return backToLogin(request, "oauth_failed");

  const code = q.get("code");
  const state = q.get("state");
  const cookieState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(GOOGLE_OAUTH_VERIFIER_COOKIE)?.value;
  if (!code || !state || !cookieState || !verifier || !safeEqual(state, cookieState)) {
    return backToLogin(request, "invalid_state");
  }

  let profile;
  try {
    profile = await exchangeGoogleCode(code, verifier);
  } catch {
    return backToLogin(request, "oauth_failed");
  }

  if (!isEmailAllowed(profile.email, process.env.ALLOWED_EMAILS)) {
    return backToLogin(request, "not_authorized");
  }

  const res = NextResponse.redirect(new URL("/dashboard", request.url));
  res.cookies.set(
    SESSION_COOKIE,
    signSession({ email: profile.email, name: profile.name, picture: profile.picture }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    }
  );
  res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(GOOGLE_OAUTH_VERIFIER_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
