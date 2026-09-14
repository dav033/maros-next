// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createDevSessionToken,
  verifyDevSessionToken,
  verifySessionToken,
} from "./session";
import { isDevAuthBypassEnabled } from "./devMode";

afterEach(() => vi.unstubAllEnvs());

describe("isDevAuthBypassEnabled", () => {
  it("requires development mode, the explicit flag, and a separate secret", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS", "true");
    vi.stubEnv("DEV_AUTH_SECRET", "local-only-secret");
    vi.stubEnv("AUTH_SECRET", "production-session-secret");
    expect(isDevAuthBypassEnabled()).toBe(true);
  });

  it("stays disabled outside development even when the flag is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEV_AUTH_BYPASS", "true");
    vi.stubEnv("DEV_AUTH_SECRET", "local-only-secret");
    expect(isDevAuthBypassEnabled()).toBe(false);
  });

  it("stays disabled until the flag is explicitly enabled", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS", "false");
    vi.stubEnv("DEV_AUTH_SECRET", "local-only-secret");
    vi.stubEnv("AUTH_SECRET", "production-session-secret");
    expect(isDevAuthBypassEnabled()).toBe(false);
  });

  it("stays disabled when its secret equals the OAuth secret", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS", "true");
    vi.stubEnv("DEV_AUTH_SECRET", "shared-secret");
    vi.stubEnv("AUTH_SECRET", "shared-secret");
    expect(isDevAuthBypassEnabled()).toBe(false);
  });

  it("signs local sessions with a secret the OAuth validator rejects", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS", "true");
    vi.stubEnv("DEV_AUTH_SECRET", "local-only-secret");
    vi.stubEnv("AUTH_SECRET", "production-session-secret");

    const token = await createDevSessionToken({
      email: "local-debug@localhost",
      name: "Local Developer",
    });

    expect(await verifyDevSessionToken(token)).toMatchObject({
      email: "local-debug@localhost",
      devSession: true,
    });
    expect(await verifySessionToken(token)).toBeNull();
  });
});
