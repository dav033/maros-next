import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/shared/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OAuth handshake routes must stay reachable before a session exists
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  // Already on login — redirect to home if already authenticated
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Not authenticated — redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
