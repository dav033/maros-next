import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieDomain } from "@/shared/auth/session";

/**
 * Browser-accessible logout endpoint. It is also used when the API reports an
 * expired session, because the HTTP-only cookie can only be removed server-side.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: sessionCookieDomain(),
  });
  return response;
}
