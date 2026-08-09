"use server";

import { cookies } from "next/headers";
import {
  unlockCookieName,
  unlockPublicNote,
} from "@/features/notes/infra/public/publicNoteClient";

export interface UnlockActionResult {
  ok: boolean;
  message?: string;
}

/**
 * Exchanges a password for the unlock proof and stores it in an httpOnly cookie on this
 * origin.
 *
 * The proof is minted and signed by the API — this only holds on to it, so the reader's
 * server-side fetches can replay it. httpOnly because nothing in the page has any
 * business reading it, and scoped to /p/<token> so one published note's proof is never
 * sent along with another's.
 *
 * The generic failure message is deliberate: the API answers 401 for both "wrong
 * password" and "this link no longer exists", and reflecting that difference back would
 * turn the form into a way to probe which tokens are real.
 */
export async function unlockPublicNoteAction(
  token: string,
  password: string
): Promise<UnlockActionResult> {
  const outcome = await unlockPublicNote(token, password);

  if (!outcome.ok || !outcome.unlockToken) {
    return { ok: false, message: "That password didn’t work." };
  }

  const store = await cookies();
  store.set(unlockCookieName(token), outcome.unlockToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: outcome.expiresInSeconds ?? 8 * 60 * 60,
    path: `/p/${token}`,
  });

  return { ok: true };
}
