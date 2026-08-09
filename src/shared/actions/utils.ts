import { AppError, GENERIC_ERROR_MESSAGE } from "@/shared/errors";
import type { AppErrorKind } from "@/shared/errors";
import type { ActionResult } from "./types";

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure(
  error: string,
  fieldErrors?: Record<string, string[]>,
  meta?: { kind?: AppErrorKind; code?: string; status?: number }
): ActionResult<never> {
  return { success: false, error, fieldErrors, ...meta };
}

export function handleActionError(error: unknown): ActionResult<never> {
  const appError = AppError.from(error);
  const message = appError.userMessage || GENERIC_ERROR_MESSAGE;
  return failure(message, appError.fieldErrors, {
    kind: appError.kind,
    code: appError.code,
    status: appError.status,
  });
}



