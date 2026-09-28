import { createRemoteJWKSet, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { ServerApiClient } from '@/shared/infra/http';
import {
  createSessionToken,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieDomain,
} from '@/shared/auth/session';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const WORKSPACE_DOMAIN = 'marosconstruction.com';
const INVITATION_CHECK_PATH = '/auth/invitations/check';
const INVITATION_CHECK_TIMEOUT_MS = 5000;

const googleJwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URI));

interface GoogleTokenResponse {
  id_token: string;
  access_token: string;
}

interface InvitationCheck {
  allowed: boolean;
  userId?: number;
  status?: 'invited' | 'active' | 'disabled';
}

function loginError(baseUrl: string, error: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${error}`, baseUrl));
}

/**
 * Asks the backend whether a non-Workspace address may be given a session. This replaces
 * the EXTERNAL_EMAIL_ALLOWLIST constant that used to live in this file, so the two Gmail
 * addresses it held MUST already exist as invited users (POST /users/invite) before this
 * ships — otherwise they lose access the moment it deploys.
 *
 * Returns null when the question could not be asked at all (no secret configured, backend
 * down, timeout). The caller denies on null: an outage must never widen access.
 */
async function checkInvitation(email: string): Promise<InvitationCheck | null> {
  const token = process.env.AUTH_INVITATION_CHECK_TOKEN;
  if (!token) return null;

  try {
    const client = new ServerApiClient(undefined, { Authorization: `Bearer ${token}` });
    const { data } = await client.post<InvitationCheck>(
      INVITATION_CHECK_PATH,
      { email },
      { signal: AbortSignal.timeout(INVITATION_CHECK_TIMEOUT_MS) }
    );
    return data;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 });
  }

  // Build absolute redirect URLs from GOOGLE_REDIRECT_URI's origin, not request.url —
  // behind Netlify's Next.js runtime, request.url resolves to the internal per-deploy
  // hostname (<hash>--site.netlify.app), not the public custom domain. A cookie scoped
  // to .marosconstruction.com never reaches that mismatched host.
  const baseUrl = new URL(redirectUri).origin;

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError(baseUrl, 'oauth');
  }

  let tokens: GoogleTokenResponse;
  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });
    if (!tokenRes.ok) {
      return loginError(baseUrl, 'oauth');
    }
    tokens = await tokenRes.json();
  } catch {
    return loginError(baseUrl, 'oauth');
  }

  let claims;
  try {
    const { payload } = await jwtVerify(tokens.id_token, googleJwks, {
      issuer: GOOGLE_ISSUERS,
      audience: clientId,
    });
    claims = payload;
  } catch {
    return loginError(baseUrl, 'oauth');
  }

  const email = typeof claims.email === 'string' ? claims.email : undefined;
  const name = typeof claims.name === 'string' ? claims.name : email;
  const picture = typeof claims.picture === 'string' ? claims.picture : undefined;
  const hd = typeof claims.hd === 'string' ? claims.hd : undefined;
  const emailVerified = claims.email_verified === true;

  const normalizedEmail = email?.trim().toLowerCase();
  const isWorkspaceAccount = hd === WORKSPACE_DOMAIN;

  if (!normalizedEmail || !emailVerified) {
    return loginError(baseUrl, 'domain');
  }

  // The Workspace domain is checked first and on its own: internal staff self-provision on
  // first login, so until then they have no user row and the backend would deny them.
  if (!isWorkspaceAccount) {
    const check = await checkInvitation(normalizedEmail);
    if (!check) {
      return loginError(baseUrl, 'unavailable');
    }
    if (!check.allowed) {
      // A known address that is blocked gets a reason; an unknown one only gets 'domain'.
      return loginError(baseUrl, check.status ? 'invitation' : 'domain');
    }
  }

  const sessionToken = await createSessionToken({
    email: normalizedEmail,
    name: name ?? normalizedEmail,
    picture,
  });

  const response = NextResponse.redirect(new URL('/dashboard', baseUrl));
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain: sessionCookieDomain(),
  });
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
