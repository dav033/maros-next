import "server-only";
import { cookies } from "next/headers";
import type { PublicNoteResponse, PublicNoteTreeNode } from "@/notes/domain";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.marosconstruction.com/api";

/** Mirrors SHARE_UNLOCK_HEADER on the API side. */
const UNLOCK_HEADER = "x-note-share-unlock";

/**
 * Why the reader talks to the API directly instead of through the usual repositories:
 * those forward the visitor's session cookie, and a published note has no session. The
 * share token in the URL is the entire authorisation.
 */
export type PublicNoteResult =
  | { status: "ok"; data: PublicNoteResponse }
  | { status: "locked" }
  | { status: "expired" }
  | { status: "not-found" };

/**
 * Where the unlock proof is kept.
 *
 * Named after a slice of the token so two published notes open in two tabs do not
 * overwrite each other's proof, and short enough that the cookie name reveals nothing
 * usable on its own.
 */
export function unlockCookieName(token: string): string {
  return `note_unlock_${token.slice(0, 12)}`;
}

async function unlockHeader(token: string): Promise<Record<string, string>> {
  const store = await cookies();
  const proof = store.get(unlockCookieName(token))?.value;
  return proof ? { [UNLOCK_HEADER]: proof } : {};
}

function publicUrl(token: string, path = ""): string {
  return `${API_BASE_URL}/public/notes/${encodeURIComponent(token)}${path}`;
}

/**
 * `cache: "no-store"` because a published note is expected to reflect edits, and
 * because caching a response that depends on an unlock header would be a way to serve
 * a locked note to somebody who never entered the password.
 */
export async function fetchPublicNote(
  token: string,
  pageId?: number
): Promise<PublicNoteResult> {
  const query = pageId != null ? `?pageId=${pageId}` : "";

  const response = await fetch(publicUrl(token, query), {
    headers: { Accept: "application/json", ...(await unlockHeader(token)) },
    cache: "no-store",
  });

  if (response.status === 401) return { status: "locked" };
  if (response.status === 410) return { status: "expired" };
  if (!response.ok) return { status: "not-found" };

  return { status: "ok", data: (await response.json()) as PublicNoteResponse };
}

export async function fetchPublicNoteTree(
  token: string
): Promise<PublicNoteTreeNode[]> {
  const response = await fetch(publicUrl(token, "/tree"), {
    headers: { Accept: "application/json", ...(await unlockHeader(token)) },
    cache: "no-store",
  });
  if (!response.ok) return [];
  return (await response.json()) as PublicNoteTreeNode[];
}

export interface UnlockOutcome {
  ok: boolean;
  unlockToken?: string;
  expiresInSeconds?: number;
}

/** Proxied rather than called from the browser, so the API host stays out of the page. */
export async function unlockPublicNote(
  token: string,
  password: string
): Promise<UnlockOutcome> {
  const response = await fetch(publicUrl(token, "/unlock"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });

  if (!response.ok) return { ok: false };

  const body = (await response.json()) as {
    unlockToken: string;
    expiresInSeconds: number;
  };
  return { ok: true, ...body };
}

/**
 * Streams one image of a published note.
 *
 * The API answers with a redirect to a short-lived presigned URL, and only for keys
 * that appear in a document this link actually publishes — a key from anywhere else in
 * the bucket answers 404 there, not here.
 */
export async function fetchPublicNoteImage(
  token: string,
  key: string
): Promise<Response> {
  return fetch(publicUrl(token, `/images/${encodeURIComponent(key)}`), {
    headers: await unlockHeader(token),
    cache: "no-store",
    redirect: "follow",
  });
}
