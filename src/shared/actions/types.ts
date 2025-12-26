/**
 * Common types for Server Actions
 */

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type ActionState<T> = {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  pending?: boolean;
};



