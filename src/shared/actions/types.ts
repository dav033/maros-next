/**
 * Common types for Server Actions
 */

import type { AppErrorKind } from "@/shared/errors";

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      /**
       * Carries AppError's classification across the server action boundary
       * (e.g. "unauthorized") so the client can react — redirect to login on
       * an expired session — instead of just displaying the message text.
       */
      kind?: AppErrorKind;
      code?: string;
      status?: number;
    };

export type ActionState<T> = {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  pending?: boolean;
};



