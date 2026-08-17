import { AppError } from "@/shared/errors";

export class RetryableUploadError extends Error {}

export function isOfflineQueueSupported(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

export function isRetryableUploadStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

export function isRetryableOfflineFailure(error: unknown, online: boolean): boolean {
  if (!online) return true;
  if (error instanceof TypeError || error instanceof RetryableUploadError) return true;
  if (error instanceof AppError) {
    return error.kind === "network" || error.kind === "timeout" || error.kind === "server" || error.kind === "rate_limited" || (error.kind === "unknown" && error.status == null);
  }
  return false;
}

export async function runWithOfflineFallback<T>(
  online: boolean,
  run: () => Promise<T>,
  queue: () => Promise<void>,
): Promise<T | undefined> {
  if (!online) {
    await queue();
    return undefined;
  }
  try {
    return await run();
  } catch (error) {
    if (!isRetryableOfflineFailure(error, online)) throw error;
    await queue();
    return undefined;
  }
}
