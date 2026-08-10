"use client";

import { useTasksApp } from "@/di";
import { tasksKeys, listTasks } from "@/tasks/application";
import type { Task, TaskFilters } from "@/tasks/domain";
import { useInstantList } from "@/shared/query";

export function useInstantTasksList(filters?: TaskFilters, initialData?: Task[]) {
  const ctx = useTasksApp();
  const result = useInstantList<Task>({
    queryKey: tasksKeys.list(filters),
    queryFn: () => listTasks(ctx, filters),
    initialData,
  });
  return { ...result, tasks: result.data ?? [] };
}
