import { createEntityKeys } from "@/shared/query";
import type { TaskFilters } from "@/features/tasks/domain";

const base = createEntityKeys<TaskFilters>("tasks");

export const tasksKeys = {
  ...base,
  board: () => [...base.all, "board"] as const,
  mine: () => [...base.all, "mine"] as const,
  archived: () => [...base.all, "archived"] as const,
  schedule: (from: string, to: string, signature = "") => [...base.all, "schedule", from, to, signature] as const,
  templates: () => [...base.all, "templates"] as const,
  savedViews: () => [...base.all, "savedViews"] as const,
  byEntity: (entityKind: string, entityId: number) =>
    [...base.all, "byEntity", entityKind, entityId] as const,
  byParty: (partyKind: string, partyId: number) =>
    [...base.all, "byParty", partyKind, partyId] as const,
} as const;

const labelsBase = createEntityKeys("taskLabels");

export const taskLabelsKeys = {
  ...labelsBase,
} as const;
