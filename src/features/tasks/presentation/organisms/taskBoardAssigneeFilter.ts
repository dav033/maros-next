import type { Task } from "@/tasks/domain";

export type AssigneeFilterKey = number | "unassigned";

/** Empty filter = show everything, same convention as the board's quick filters. */
export function matchesAssigneeFilter(task: Task, filter: Set<AssigneeFilterKey>): boolean {
  if (filter.size === 0) return true;
  if (!task.assignee) return filter.has("unassigned");
  return filter.has(task.assignee.id);
}
