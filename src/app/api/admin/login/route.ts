import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_MAX_AGE, sessionToken } from "@/lib/admin/session";

export const runtime = "nodejs";

/**
 * A RELATIVE Location header, deliberately.
 *
 * NextResponse.redirect() needs an absolute URL, and building one from
 * request.url can resolve to a different host than the browser asked for
 * (127.0.0.1 → localhost behind a proxy, or the internal hostname on Vercel).
 * The browser would then follow the redirect to a different origin and drop
 * the cookie we just set. Relative Location headers are legal and hop nowhere.
 */
function redirectTo(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

/**
 * Exchanges the shared password for a session cookie.
 *
 * Accepts a normal form POST so /admin/login works with JavaScript disabled.
 */
export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return new NextResponse(null, { status: 404 });

  const form = await request.formData();
  const supplied = String(form.get("password") ?? "");

  if (supplied !== password) {
    // Deliberately vague, and deliberately slow enough to be tedious to
    // brute-force through a network round trip.
    await new Promise((r) => setTimeout(r, 600));
    return redirectTo("/admin/login?e=1");
  }

  const res = redirectTo("/admin");
  res.cookies.set(ADMIN_COOKIE, await sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}

/** Sign out. */
export async function DELETE() {
  const res = redirectTo("/admin/login");
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
