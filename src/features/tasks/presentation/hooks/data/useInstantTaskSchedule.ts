"use client";

import { useQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { getTaskSchedule, tasksKeys } from "@/tasks/application";
import type { TaskScheduleFilters } from "@/tasks/domain";

export function useInstantTaskSchedule(filters: TaskScheduleFilters) {
  const ctx = useTasksApp();
  const query = useQuery({
    queryKey: tasksKeys.schedule(filters.from, filters.to, JSON.stringify(filters)),
    queryFn: () => getTaskSchedule(ctx, filters),
    staleTime: 30_000,
  });
  return { tasks: query.data ?? [], ...query };
}
