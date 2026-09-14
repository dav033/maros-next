import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createDevSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifyDevSessionToken,
  verifySessionToken,
} from "@/shared/auth/session";
import { isDevAuthBypassEnabled } from "@/shared/auth/devMode";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OAuth handshake routes must stay reachable before a session exists
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Published notes. The share token in the URL is the whole authorisation, checked by
  // NoteShareLinkGuard on the API side — an unknown, revoked or expired one gets
  // nothing. Redirecting these to /login would break the one thing the feature is for:
  // sending a note to somebody who has no account here.
  if (pathname.startsWith("/p/")) {
    // Server components cannot read the pathname, and the root layout needs it to skip
    // resolving a signed-in user that a public reader will never have.
    const headers = new Headers(request.headers);
    headers.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers } });
  }

  if (isDevAuthBypassEnabled()) {
    const existingToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (existingToken && (await verifyDevSessionToken(existingToken))) {
      if (pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    const devToken = await createDevSessionToken({
      email: "local-debug@localhost",
      name: "Local Developer",
    });
    const requestCookies = request.cookies
      .getAll()
      .filter(({ name }) => name !== SESSION_COOKIE)
      .map(({ name, value }) => `${name}=${value}`);
    requestCookies.push(`${SESSION_COOKIE}=${devToken}`);

    const headers = new Headers(request.headers);
    headers.set("cookie", requestCookies.join("; "));
    const response =
      pathname === "/login"
        ? NextResponse.redirect(new URL("/dashboard", request.url))
        : NextResponse.next({ request: { headers } });
    response.cookies.set(SESSION_COOKIE, devToken, {
      httpOnly: true,
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
      sameSite: "lax",
      secure: false,
    });
    return response;
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionCookie
    ? await verifySessionToken(sessionCookie)
    : null;

  // Already on login — redirect to home if already authenticated
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Not authenticated — redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
