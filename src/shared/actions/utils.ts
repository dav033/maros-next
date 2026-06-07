import { AppError, GENERIC_ERROR_MESSAGE } from "@/shared/errors";
import type { ActionResult } from "./types";

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return { success: false, error, fieldErrors };
}

export function handleActionError(error: unknown): ActionResult<never> {
  const appError = AppError.from(error);
  const message = appError.userMessage || GENERIC_ERROR_MESSAGE;
  return failure(message, appError.fieldErrors);
}



