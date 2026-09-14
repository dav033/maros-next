// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { getOpenAiApiKey } from "./openaiApiKey";

afterEach(() => vi.unstubAllEnvs());

describe("getOpenAiApiKey", () => {
  it("uses OPENAI_KEY when it is configured", () => {
    vi.stubEnv("OPENAI_KEY", "legacy-key");
    vi.stubEnv("OPENAI_API_KEY", "standard-key");

    expect(getOpenAiApiKey()).toBe("legacy-key");
  });

  it("falls back to the standard OPENAI_API_KEY", () => {
    vi.stubEnv("OPENAI_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "standard-key");

    expect(getOpenAiApiKey()).toBe("standard-key");
  });
});
