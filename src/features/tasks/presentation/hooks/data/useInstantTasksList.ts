"use client";

import { useQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { tasksKeys, listTasks } from "@/tasks/application";
import type { TaskFilters, TaskListResult } from "@/tasks/domain";
import { buildInstantQueryResult } from "@/shared/query";
import { STALE_TIMES } from "@/shared/lib/queryClient";

const EMPTY_LIST: TaskListResult = { items: [], totalCount: 0 };

/**
 * Not built on the shared useInstantList (which assumes a bare-array response) —
 * GET /tasks now returns { items, totalCount } so the toolbar can tell "that's
 * everything" apart from "there's more, narrow with a filter" — see TaskListResult.
 */
export function useInstantTasksList(filters?: TaskFilters) {
  const ctx = useTasksApp();
  const query = useQuery<TaskListResult, Error>({
    queryKey: tasksKeys.list(filters),
    queryFn: () => listTasks(ctx, filters),
    staleTime: STALE_TIMES.lists,
  });
  const result = buildInstantQueryResult<TaskListResult>(query, EMPTY_LIST, STALE_TIMES.lists);
  const data = result.data ?? EMPTY_LIST;
  return { ...result, tasks: data.items, totalCount: data.totalCount };
}
