import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, safeEqual, sessionToken } from "@/lib/admin/session";

/**
 * PROXY — what Next.js called Middleware before 16.
 *
 * Its only job is the /admin gate.
 *
 * FAIL CLOSED. With no ADMIN_PASSWORD configured, /admin is a 404 rather than
 * an open door. An unconfigured secret must never mean "no lock" — and a 404
 * tells a prober less than a login form would.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse(null, { status: 404, headers: { "x-robots-tag": "noindex, nofollow" } });
  }

  // The login page and its endpoint have to stay reachable, or the redirect
  // below is a loop.
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/")) {
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
  }

  const cookie = request.cookies.get(ADMIN_COOKIE)?.value ?? "";
  const expected = await sessionToken(password);

  if (!safeEqual(cookie, expected)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    const res = NextResponse.redirect(url);
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
