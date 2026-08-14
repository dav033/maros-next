import type { Task } from "@/tasks/domain";
import type { TaskReorderInput } from "@/tasks/domain";

/**
 * Where a dragged subtask lands, expressed the way the API wants it. Same
 * before/after reasoning as the board's resolveCardDropSide: dragging *down* past a
 * sibling means landing after it, dragging *up* means landing before it. Sending the
 * wrong side is off by one row and reads as the card refusing to move.
 */
export function resolveSubtaskDrop(
  subtasks: Task[],
  activeId: number,
  overId: number
): TaskReorderInput | null {
  if (activeId === overId) return null;

  const from = subtasks.findIndex((s) => s.id === activeId);
  const to = subtasks.findIndex((s) => s.id === overId);
  if (from === -1 || to === -1) return null;

  return from < to ? { afterId: overId } : { beforeId: overId };
}

/** The order the list should show while the request is still in flight. */
export function reorderSubtasks(subtasks: Task[], activeId: number, overId: number): Task[] {
  const from = subtasks.findIndex((s) => s.id === activeId);
  const to = subtasks.findIndex((s) => s.id === overId);
  if (from === -1 || to === -1 || from === to) return subtasks;

  const next = [...subtasks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
