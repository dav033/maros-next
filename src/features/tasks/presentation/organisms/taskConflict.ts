import { AppError } from "@/shared/errors";

/** True when a TaskPatch save failed because `expectedUpdatedAt` was stale — see TaskConflictException on the backend. */
export function isTaskConflictError(error: unknown): boolean {
  return error instanceof AppError && error.code === "TASK_CONFLICT";
}
