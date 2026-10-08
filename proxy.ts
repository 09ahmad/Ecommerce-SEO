import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

const PROTECTED_PAGES = ["/dashboard", "/tool"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = verifySession(session);

  const isProtectedApi = pathname.startsWith("/api/keywords") || pathname === "/api/health";
  const isProtectedPage = PROTECTED_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isPublicEntry = pathname === "/" || pathname === "/login";

  if (isProtectedApi) {
    if (authed) return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isProtectedPage) {
    if (authed) return NextResponse.next();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicEntry && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/tool/:path*",
    "/dashboard/:path*",
    "/api/keywords/:path*",
    "/api/health",
  ],
};
