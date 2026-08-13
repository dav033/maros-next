import { describe, expect, it } from "vitest";
import { scopeForTaskPatch } from "./taskInvalidationScope";

describe("scopeForTaskPatch", () => {
  it("scopes a description-only edit to detail — the frequent autosave-on-blur case", () => {
    expect(scopeForTaskPatch({ description: { type: "doc", content: [] } })).toBe("detail");
  });

  it("scopes reporterId and startDate edits to detail — neither renders outside it", () => {
    expect(scopeForTaskPatch({ reporterId: 4 })).toBe("detail");
    expect(scopeForTaskPatch({ startDate: "2026-01-01" })).toBe("detail");
    expect(scopeForTaskPatch({ reporterId: 4, startDate: "2026-01-01" })).toBe("detail");
  });

  it("ignores expectedUpdatedAt when deciding scope — it's request metadata, not a rendered field", () => {
    expect(scopeForTaskPatch({ description: {}, expectedUpdatedAt: "2026-01-01T00:00:00.000Z" })).toBe(
      "detail"
    );
  });

  it("scopes a priority-only edit to detail+board+lists — shown everywhere except Mine", () => {
    expect(scopeForTaskPatch({ priority: "urgent" })).toBe("detail+board+lists");
  });

  it("scopes a priority + description edit to detail+board+lists", () => {
    expect(scopeForTaskPatch({ priority: "high", description: {} })).toBe("detail+board+lists");
  });

  it("falls through to all for title — rendered on Mine too", () => {
    expect(scopeForTaskPatch({ title: "Renamed" })).toBe("all");
  });

  it("falls through to all for kind — rendered on Mine too", () => {
    expect(scopeForTaskPatch({ kind: "permit" })).toBe("all");
  });

  it("falls through to all for dueDate — Mine buckets by it server-side", () => {
    expect(scopeForTaskPatch({ dueDate: "2026-02-01" })).toBe("all");
  });

  it("falls through to all for blockedReason", () => {
    expect(scopeForTaskPatch({ blockedReason: "Waiting on permit" })).toBe("all");
  });

  it("falls through to all when a wide field is mixed with a narrow one", () => {
    expect(scopeForTaskPatch({ title: "Renamed", description: {} })).toBe("all");
  });

  it("scopes an empty patch to detail", () => {
    expect(scopeForTaskPatch({})).toBe("detail");
  });
});
