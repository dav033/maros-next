import type { QueryClient } from "@tanstack/react-query";
import { tasksKeys } from "@/tasks/application";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskStatus } from "@/tasks/domain";

export type TaskSummaryPreview = {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTaskSummaryPreview(value: unknown, id: number): value is TaskSummaryPreview {
  if (!isRecord(value)) return false;
  return (
    value.id === id &&
    typeof value.title === "string" &&
    TASK_STATUSES.some((status) => status === value.status) &&
    TASK_PRIORITIES.some((priority) => priority === value.priority) &&
    (value.dueDate === null || typeof value.dueDate === "string")
  );
}

function findInCacheValue(
  value: unknown,
  id: number,
  visited: Set<object>,
): TaskSummaryPreview | null {
  if (isTaskSummaryPreview(value, id)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findInCacheValue(item, id, visited);
      if (result) return result;
    }
    return null;
  }
  if (!isRecord(value) || visited.has(value)) return null;
  visited.add(value);
  for (const nested of Object.values(value)) {
    if (Array.isArray(nested) || isRecord(nested)) {
      const result = findInCacheValue(nested, id, visited);
      if (result) return result;
    }
  }
  return null;
}

/** Finds the task's validated summary fields so the detail surface can render before its full read completes. */
export function findTaskSummaryFromCache(
  queryClient: QueryClient,
  id: number | null,
): TaskSummaryPreview | null {
  if (id === null) return null;
  const visited = new Set<object>();
  for (const [, value] of queryClient.getQueriesData({ queryKey: tasksKeys.all })) {
    const summary = findInCacheValue(value, id, visited);
    if (summary) return summary;
  }
  return null;
}
