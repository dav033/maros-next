"use client";

import { useTasksApp } from "@/di";
import { taskLabelsKeys, listTaskLabels } from "@/tasks/application";
import type { TaskLabel } from "@/tasks/domain";
import { useInstantList } from "@/shared/query";

export function useInstantTaskLabels() {
  const ctx = useTasksApp();
  const result = useInstantList<TaskLabel>({
    queryKey: taskLabelsKeys.lists(),
    queryFn: () => listTaskLabels(ctx),
  });
  return { ...result, labels: result.data ?? [] };
}
