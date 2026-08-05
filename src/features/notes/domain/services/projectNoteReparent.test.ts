import { describe, expect, it } from "vitest";
import { projectNoteReparent } from "./projectNoteReparent";

// Tree used across most cases:
// 1 (depth 0)
//   2 (depth 1)
// 3 (depth 0)
// 4 (depth 0)
const BASE_ROWS = [
  { id: 1, depth: 0 },
  { id: 2, depth: 1 },
  { id: 3, depth: 0 },
  { id: 4, depth: 0 },
];

describe("projectNoteReparent", () => {
  it("returns null when the active id is not present", () => {
    expect(projectNoteReparent(BASE_ROWS, 999, 3, 0)).toBeNull();
  });

  it("returns null when the over id is not present (e.g. dropped on an excluded descendant)", () => {
    expect(projectNoteReparent(BASE_ROWS, 3, 999, 0)).toBeNull();
  });

  it("reorders as a root sibling when dropped at the same depth with no horizontal drag", () => {
    const result = projectNoteReparent(BASE_ROWS, 4, 1, 0);
    expect(result).toEqual({ parentId: null, beforeId: 1, afterId: null });
  });

  it("nests under the previous row when dragged one indent level to the right", () => {
    // 3 lands between 1 and 2 in the new order; +1 indent nests it as 1's first child.
    const result = projectNoteReparent(BASE_ROWS, 3, 2, 1);
    expect(result).toEqual({ parentId: 1, beforeId: 2, afterId: null });
  });

  it("clamps nesting to at most one level deeper than the previous row", () => {
    // Even with a huge rightward drag, 3 can't nest deeper than previous.depth + 1.
    const result = projectNoteReparent(BASE_ROWS, 3, 2, 10);
    expect(result?.parentId).toBe(1);
  });

  it("un-nests to root when a nested row is dragged left past its parent's depth", () => {
    // 2 is currently a child of 1. Dragging it out past 3 with a leftward offset
    // pops it out to root, landing between 3 and 4.
    const result = projectNoteReparent(BASE_ROWS, 2, 3, -1);
    expect(result).toEqual({ parentId: null, beforeId: 4, afterId: 3 });
  });

  it("clamps depth so it never goes shallower than the next row requires, and skips past deeper descendants when scanning for a sibling anchor", () => {
    // Dropping 4 near 3 with a big leftward drag clamps to depth 0. Scanning back for
    // a depth-0 anchor skips over 2 (depth 1, a descendant of 1) and lands on 1.
    const result = projectNoteReparent(BASE_ROWS, 4, 3, -5);
    expect(result).toEqual({ parentId: null, beforeId: 3, afterId: 1 });
  });

  it("places a page as the first root when dropped before everything with no previous row", () => {
    const result = projectNoteReparent(BASE_ROWS, 3, 1, 0);
    expect(result).toEqual({ parentId: null, beforeId: 1, afterId: null });
  });
});
