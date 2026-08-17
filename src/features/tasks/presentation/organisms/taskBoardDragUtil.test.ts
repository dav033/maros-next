import { describe, expect, it } from "vitest";
import { resolveCardDropSide } from "./taskBoardDragUtil";

describe("resolveCardDropSide", () => {
  const column = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

  it("drops before when dragging upward onto an earlier card", () => {
    // Task 4 dragged onto task 2's slot — moving up the column.
    expect(resolveCardDropSide(column, 4, 2)).toBe("before");
  });

  it("drops after when dragging downward onto a later card — the bug this fixes", () => {
    // Task 1 dragged onto its immediate neighbor task 2 — "before task 2" would
    // resolve to the gap task 1 just vacated (a no-op) once the backend excludes
    // the dragged task from the column before computing position.
    expect(resolveCardDropSide(column, 1, 2)).toBe("after");
  });

  it("drops after for any downward move, not just the adjacent-card case", () => {
    expect(resolveCardDropSide(column, 1, 4)).toBe("after");
  });

  it("drops before when the dragged card isn't in this column yet (cross-column move)", () => {
    // taskId 99 belongs to a different status column — fromIndex is -1, so there is
    // no "direction" to speak of; always insert before the card dropped on.
    expect(resolveCardDropSide(column, 99, 2)).toBe("before");
  });

  it("drops before when dropped on itself (no-op guard upstream still applies)", () => {
    expect(resolveCardDropSide(column, 2, 2)).toBe("before");
  });
});
