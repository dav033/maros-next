"use client";

import { useQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { tasksKeys, getTask } from "@/tasks/application";
import type { TaskDetail } from "@/tasks/domain";
import { buildInstantQueryResult } from "@/shared/query";
import { STALE_TIMES } from "@/shared/lib/queryClient";

/** `id: null` disables the fetch — used while the detail sheet is closed. */
export function useInstantTask(id: number | null) {
  const ctx = useTasksApp();
  const query = useQuery<TaskDetail | undefined, Error>({
    queryKey: tasksKeys.detail(id ?? -1),
    queryFn: () => getTask(ctx, id as number),
    enabled: id !== null,
    staleTime: STALE_TIMES.detail,
  });
  return buildInstantQueryResult<TaskDetail | undefined>(query, undefined, STALE_TIMES.detail);
}
