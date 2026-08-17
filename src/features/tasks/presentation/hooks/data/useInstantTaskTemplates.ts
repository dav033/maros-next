"use client";

import { useQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { listTaskTemplates, tasksKeys } from "@/tasks/application";

export function useInstantTaskTemplates() {
  const ctx = useTasksApp();
  const query = useQuery({
    queryKey: tasksKeys.templates(),
    queryFn: () => listTaskTemplates(ctx),
    staleTime: 5 * 60_000,
  });
  return { templates: query.data ?? [], ...query };
}
