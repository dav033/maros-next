import { describe, expect, it } from "vitest";
import { excludeDescendantRows } from "./excludeDescendantRows";

describe("excludeDescendantRows", () => {
  it("removes a contiguous run of deeper rows right after the active row", () => {
    const rows = [
      { id: 1, depth: 0 },
      { id: 2, depth: 0 }, // active
      { id: 3, depth: 1 }, // child of 2
      { id: 4, depth: 2 }, // grandchild of 2
      { id: 5, depth: 0 }, // unrelated sibling
    ];
    expect(excludeDescendantRows(rows, 2).map((r) => r.id)).toEqual([1, 2, 5]);
  });

  it("keeps the active row even when it has no descendants", () => {
    const rows = [
      { id: 1, depth: 0 },
      { id: 2, depth: 0 },
    ];
    expect(excludeDescendantRows(rows, 1).map((r) => r.id)).toEqual([1, 2]);
  });

  it("returns the list unchanged when the active id is not found", () => {
    const rows = [{ id: 1, depth: 0 }];
    expect(excludeDescendantRows(rows, 999)).toEqual(rows);
  });

  it("stops at the first row that returns to the active row's depth or shallower", () => {
    const rows = [
      { id: 1, depth: 0 }, // active
      { id: 2, depth: 1 },
      { id: 3, depth: 1 },
      { id: 4, depth: 0 },
    ];
    expect(excludeDescendantRows(rows, 1).map((r) => r.id)).toEqual([1, 4]);
  });
});
