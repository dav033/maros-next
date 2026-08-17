import { describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors";
import { isRetryableOfflineFailure, isRetryableUploadStatus, RetryableUploadError, runWithOfflineFallback } from "./offlineRetryPolicy";

describe("offline retry policy", () => {
  it("retries transient upload statuses but never permanent client errors", () => {
    expect(isRetryableUploadStatus(408)).toBe(true);
    expect(isRetryableUploadStatus(429)).toBe(true);
    expect(isRetryableUploadStatus(503)).toBe(true);
    expect(isRetryableUploadStatus(403)).toBe(false);
    expect(isRetryableUploadStatus(422)).toBe(false);
  });

  it("queues network/server failures while preserving permanent API errors", () => {
    expect(isRetryableOfflineFailure(new TypeError("Failed to fetch"), true)).toBe(true);
    expect(isRetryableOfflineFailure(new RetryableUploadError(), true)).toBe(true);
    expect(isRetryableOfflineFailure(new AppError({ userMessage: "down", kind: "network" }), true)).toBe(true);
    expect(isRetryableOfflineFailure(new AppError({ userMessage: "slow", kind: "timeout" }), true)).toBe(true);
    expect(isRetryableOfflineFailure(new AppError({ userMessage: "busy", kind: "rate_limited", status: 429 }), true)).toBe(true);
    expect(isRetryableOfflineFailure(new AppError({ userMessage: "down", kind: "server", status: 503 }), true)).toBe(true);
    expect(isRetryableOfflineFailure(new AppError({ userMessage: "no", kind: "forbidden", status: 403 }), true)).toBe(false);
    expect(isRetryableOfflineFailure(new Error("validation"), true)).toBe(false);
    expect(isRetryableOfflineFailure(new Error("anything"), false)).toBe(true);
  });

  it("runs move/postpone-style actions online and queues only transient failures", async () => {
    const run = vi.fn().mockRejectedValue(new AppError({ userMessage: "down", kind: "network" }));
    const queue = vi.fn().mockResolvedValue(undefined);
    await expect(runWithOfflineFallback(true, run, queue)).resolves.toBeUndefined();
    expect(queue).toHaveBeenCalledOnce();

    const permanent = vi.fn().mockRejectedValue(new AppError({ userMessage: "no", kind: "validation", status: 422 }));
    await expect(runWithOfflineFallback(true, permanent, queue)).rejects.toBeInstanceOf(AppError);

    const offlineRun = vi.fn().mockResolvedValue("should not run");
    await expect(runWithOfflineFallback(false, offlineRun, queue)).resolves.toBeUndefined();
    expect(offlineRun).not.toHaveBeenCalled();
  });
});
