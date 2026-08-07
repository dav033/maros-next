import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'maros_session';
export const OAUTH_STATE_COOKIE = 'oauth_state';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

export interface SessionPayload {
  email: string;
  name: string;
  picture?: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== 'string' || typeof payload.name !== 'string') {
      return null;
    }
    return {
      email: payload.email,
      name: payload.name,
      picture: typeof payload.picture === 'string' ? payload.picture : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Cookies must be host-only in local dev (no `domain`) — browsers reject a
 * `Domain` attribute set to `localhost`. In production it's set to the apex
 * domain so the cookie also reaches api.marosconstruction.com.
 */
export function sessionCookieDomain(): string | undefined {
  return process.env.NODE_ENV === 'production' ? '.marosconstruction.com' : undefined;
}
