import { BOARD_STATUSES } from "@/tasks/domain";
import type { Task, TaskPersonRef, TaskStatus } from "@/tasks/domain";
import type { AssigneeFilterKey } from "./taskBoardAssigneeFilter";

export interface AssigneeGroup {
  key: AssigneeFilterKey;
  person: TaskPersonRef | null;
  columns: Partial<Record<TaskStatus, Task[]>>;
  total: number;
}

/**
 * One row per assignee for the board's "group by assignee" swimlane view — the
 * workload-distribution view from the plan, read-only (see TaskBoard for why
 * drag-and-drop stays off in this mode). "Unassigned" always sorts last, named
 * assignees alphabetically by name/email — same trailing-fallback convention the list
 * view uses for "cancelled".
 */
export function groupTasksByAssignee(board: Partial<Record<TaskStatus, Task[]>>): AssigneeGroup[] {
  const groups = new Map<AssigneeFilterKey, AssigneeGroup>();

  for (const status of BOARD_STATUSES) {
    for (const task of board[status] ?? []) {
      const key: AssigneeFilterKey = task.assignee ? task.assignee.id : "unassigned";
      let group = groups.get(key);
      if (!group) {
        group = { key, person: task.assignee, columns: {}, total: 0 };
        groups.set(key, group);
      }
      const bucket = group.columns[status] ?? [];
      bucket.push(task);
      group.columns[status] = bucket;
      group.total += 1;
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.key === "unassigned") return 1;
    if (b.key === "unassigned") return -1;
    const nameOf = (g: AssigneeGroup) => g.person?.name ?? g.person?.email ?? "";
    return nameOf(a).localeCompare(nameOf(b));
  });
}
