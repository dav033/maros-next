import type { TaskStatus } from "@/tasks/domain";

export type TaskBoardDragPreview = {
  taskId: number;
  toStatus: TaskStatus;
  beforeId?: number;
  afterId?: number;
};

export function sameDragPreview(
  left: TaskBoardDragPreview | null,
  right: TaskBoardDragPreview | null,
): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  return left.taskId === right.taskId
    && left.toStatus === right.toStatus
    && left.beforeId === right.beforeId
    && left.afterId === right.afterId;
}

/**
 * dnd-kit's `over.id` is always the card being dropped ON — the caller has to decide
 * whether that means "take this card's spot" (before) or "land right after it"
 * (after). Within the same column, dropping on the card immediately below the dragged
 * one is exactly the "move down one slot" gesture, and "before" can't express it: the
 * backend's position resolver excludes the dragged task from its column before
 * resolving `beforeId`, so "before my old next-door neighbor" resolves to the gap the
 * dragged task just vacated — a no-op (see computeInsertPosition on the backend).
 *
 * `targetList` must be the target column's *unfiltered* task order — a quick filter
 * or search can hide the very cards whose position this comparison depends on.
 */
export function resolveCardDropSide(
  targetList: ReadonlyArray<{ id: number }>,
  taskId: number,
  overTaskId: number
): "before" | "after" {
  const fromIndex = targetList.findIndex((t) => t.id === taskId);
  const toIndex = targetList.findIndex((t) => t.id === overTaskId);
  const movingDown = fromIndex !== -1 && toIndex !== -1 && toIndex > fromIndex;
  return movingDown ? "after" : "before";
}
