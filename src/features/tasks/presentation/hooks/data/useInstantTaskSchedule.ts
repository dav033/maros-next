"use client";

import { useNavigationDetailQuery } from "@/shared/query/useNavigationDetailQuery";
import { useTasksApp } from "@/di";
import { getTaskSchedule, tasksKeys } from "@/tasks/application";
import type { TaskScheduleFilters } from "@/tasks/domain";

export function useInstantTaskSchedule(filters: TaskScheduleFilters) {
  const ctx = useTasksApp();
  const query = useNavigationDetailQuery({
    queryKey: tasksKeys.schedule(filters.from, filters.to, JSON.stringify(filters)),
    queryFn: () => getTaskSchedule(ctx, filters),
    staleTime: 30_000,
  });
  return { tasks: query.data ?? [], ...query };
}
