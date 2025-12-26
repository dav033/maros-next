import type { ActionResult } from "./types";

/**
 * Utility function to create a successful action result
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Utility function to create a failed action result
 */
export function failure(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return { success: false, error, fieldErrors };
}

/**
 * Utility function to handle action errors
 */
export function handleActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    return failure(error.message);
  }
  return failure("An unknown error occurred");
}



