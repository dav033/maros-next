import { describe, expect, it } from "vitest";
import { dynamic } from "./page";

describe("leads by type route", () => {
  it("renders per request instead of embedding lead data at build time", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});
