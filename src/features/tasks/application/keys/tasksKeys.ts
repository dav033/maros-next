import { createEntityKeys } from "@/shared/query";
import type { TaskFilters } from "@/features/tasks/domain";

const base = createEntityKeys<TaskFilters>("tasks");

export const tasksKeys = {
  ...base,
  board: () => [...base.all, "board"] as const,
  mine: () => [...base.all, "mine"] as const,
  byEntity: (entityKind: string, entityId: number) =>
    [...base.all, "byEntity", entityKind, entityId] as const,
} as const;

const labelsBase = createEntityKeys("taskLabels");

export const taskLabelsKeys = {
  ...labelsBase,
} as const;
