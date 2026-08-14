"use client";

import { AppError, emitUnauthorized } from "@/shared/errors";
import type { ActionResult } from "./types";

type ActionFailure = Extract<ActionResult<unknown>, { success: false }>;

/**
 * For components that call a server action directly, outside React Query (which
 * handles this in the query client) and outside useFormController.
 *
 * A server action cannot dispatch the unauthorized event itself — it has no
 * `window` — so an expired session only travels back as `kind: "unauthorized"` on
 * the failed result. Route it through here and GlobalAuthHandler will clear the
 * cookie via /api/auth/logout and force a fresh login, instead of the caller
 * showing "Tu sesión expiró" on a loop against a session that will never recover.
 *
 * Returns the message to display, so callers keep their existing toast.
 */
export function reportActionFailure(failure: ActionFailure): string {
  if (failure.kind === "unauthorized") {
    emitUnauthorized(
      new AppError({
        userMessage: failure.error,
        kind: "unauthorized",
        code: failure.code,
        status: failure.status,
      })
    );
  }
  return failure.error;
}
