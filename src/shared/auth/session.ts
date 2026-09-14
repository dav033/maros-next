import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "maros_session";
export const OAUTH_STATE_COOKIE = "oauth_state";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

export interface SessionPayload {
  email: string;
  name: string;
  picture?: string;
  devSession?: boolean;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

function getDevSecretKey(): Uint8Array {
  const secret = process.env.DEV_AUTH_SECRET;
  if (!secret || secret === process.env.AUTH_SECRET) {
    throw new Error(
      "DEV_AUTH_SECRET must be configured separately from AUTH_SECRET",
    );
  }
  return new TextEncoder().encode(secret);
}

async function signSessionToken(
  payload: SessionPayload,
  secretKey: Uint8Array,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

async function readSessionToken(
  token: string,
  secretKey: Uint8Array,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    const session: SessionPayload = {
      email: payload.email,
      name: payload.name,
      picture:
        typeof payload.picture === "string" ? payload.picture : undefined,
    };
    if (payload.devSession === true) session.devSession = true;
    return session;
  } catch {
    return null;
  }
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return signSessionToken(payload, getSecretKey());
}

export async function createDevSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return signSessionToken({ ...payload, devSession: true }, getDevSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  return readSessionToken(token, getSecretKey());
}

export async function verifyDevSessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (process.env.DEV_AUTH_SECRET === process.env.AUTH_SECRET) return null;
  const session = await readSessionToken(token, getDevSecretKey());
  return session?.devSession ? session : null;
}

/**
 * Cookies must be host-only in local dev (no `domain`) — browsers reject a
 * `Domain` attribute set to `localhost`. In production it's set to the apex
 * domain so the cookie also reaches api.marosconstruction.com.
 */
export function sessionCookieDomain(): string | undefined {
  return process.env.NODE_ENV === "production"
    ? ".marosconstruction.com"
    : undefined;
}
