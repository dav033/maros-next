import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE_SECONDS } from '@/shared/auth/session';

const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
  }

  const state = randomBytes(32).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    // Do not constrain Google's account picker to Workspace. The callback remains
    // the authority: it accepts the organization plus one explicitly allowlisted
    // external account, and rejects every other external identity.
    prompt: 'select_account',
  });

  const response = NextResponse.redirect(`${GOOGLE_AUTHORIZATION_ENDPOINT}?${params.toString()}`);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
