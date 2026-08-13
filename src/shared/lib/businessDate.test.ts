import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { todayInBusinessTimezone } from "./businessDate";

describe("todayInBusinessTimezone", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a YYYY-MM-DD string", () => {
    expect(todayInBusinessTimezone()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses America/New_York, not UTC or the process's local timezone", () => {
    // 2026-01-01T03:00:00Z is still 2025-12-31 22:00 in America/New_York (UTC-5) —
    // a naive `new Date().toISOString().split("T")[0]` would say "2026-01-01" here.
    // This is exactly the discrepancy A3 fixes: two different "today"s depending on
    // which clock a piece of the app happens to read.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T03:00:00Z"));

    expect(todayInBusinessTimezone()).toBe("2025-12-31");
  });

  it("crosses into the next day once it's past midnight in America/New_York", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T05:30:00Z")); // 00:30 ET

    expect(todayInBusinessTimezone()).toBe("2026-01-01");
  });
});
