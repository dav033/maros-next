import { afterEach, describe, expect, it, vi } from "vitest";
import { UNAUTHORIZED_EVENT } from "@/shared/errors";
import { reportActionFailure } from "./clientResult";

function listenOnce() {
  const handler = vi.fn();
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return {
    handler,
    stop: () => window.removeEventListener(UNAUTHORIZED_EVENT, handler),
  };
}

describe("reportActionFailure", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("announces an expired session so the app can force a re-login", () => {
    const { handler, stop } = listenOnce();

    const message = reportActionFailure({
      success: false,
      error: "Tu sesión expiró. Inicia sesión nuevamente.",
      kind: "unauthorized",
      status: 401,
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(message).toBe("Tu sesión expiró. Inicia sesión nuevamente.");
    stop();
  });

  it("stays quiet for failures that are not an expired session", () => {
    const { handler, stop } = listenOnce();

    const message = reportActionFailure({
      success: false,
      error: "No encontramos lo que buscabas.",
      kind: "not_found",
      status: 404,
    });

    expect(handler).not.toHaveBeenCalled();
    expect(message).toBe("No encontramos lo que buscabas.");
    stop();
  });

  it("stays quiet when the failure carries no kind at all", () => {
    const { handler, stop } = listenOnce();

    reportActionFailure({ success: false, error: "Invalid lead ID" });

    expect(handler).not.toHaveBeenCalled();
    stop();
  });
});
