"use client";

import { useInstantList } from "@/shared/query";
import { useTasksApp } from "@/di";
import { tasksKeys, listTasksByEntity } from "@/tasks/application";
import type { Task, TaskEntityKind } from "@/tasks/domain";

export function useInstantTasksByEntity(entityKind: TaskEntityKind, entityId: number) {
  const ctx = useTasksApp();
  const result = useInstantList<Task>({
    queryKey: tasksKeys.byEntity(entityKind, entityId),
    queryFn: () => listTasksByEntity(ctx, entityKind, entityId),
  });
  return { ...result, tasks: result.data ?? [] };
}
