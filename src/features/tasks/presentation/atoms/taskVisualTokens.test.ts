import { describe, expect, it } from "vitest";
import { humanizeEntityStatus } from "./taskVisualTokens";

describe("humanizeEntityStatus", () => {
  it("lowercases and joins with spaces, capitalizing only the first word", () => {
    expect(humanizeEntityStatus("ESTIMATING_PREPARING_PROPOSAL")).toBe(
      "Estimating preparing proposal"
    );
  });

  it("handles a single-word status", () => {
    expect(humanizeEntityStatus("WON")).toBe("Won");
  });

  it("handles a two-word status", () => {
    expect(humanizeEntityStatus("IN_PROGRESS")).toBe("In progress");
  });
});
