"use client";

import { useInstantList } from "@/shared/query";
import { useTasksApp } from "@/di";
import { listTasksByParty, tasksKeys } from "@/tasks/application";
import type { Task } from "@/tasks/domain";

export function useInstantTasksByParty(
  partyKind: "company" | "contact" | undefined,
  partyId: number | undefined,
) {
  const ctx = useTasksApp();
  const result = useInstantList<Task>({
    queryKey: tasksKeys.byParty(partyKind ?? "company", partyId ?? -1),
    queryFn: () => listTasksByParty(ctx, partyKind as "company" | "contact", partyId as number),
    enabled: partyKind != null && partyId != null,
  });
  return { ...result, tasks: result.data ?? [] };
}
