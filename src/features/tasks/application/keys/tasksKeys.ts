import { createEntityKeys } from "@/shared/query";
import type { TaskFilters } from "@/features/tasks/domain";

const base = createEntityKeys<TaskFilters>("tasks");

export const tasksKeys = {
  ...base,
  /** Prefix for every board query. Keep filters as the final, canonical segment. */
  board: (filters?: TaskFilters) => [...base.all, "board", normalizeTaskFilters(filters)] as const,
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

/**
 * Query keys must not depend on optional `undefined` properties or array order.
 * The board and its optimistic/SSE consumers all use this same representation.
 */
export function normalizeTaskFilters(filters?: TaskFilters): TaskFilters {
  if (!filters) return {};

  const normalized = Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? [...value].sort((a, b) => String(a).localeCompare(String(b))) : value,
      ])
      .sort((left, right) => String(left[0]).localeCompare(String(right[0]))),
  );

  return normalized as TaskFilters;
}

const labelsBase = createEntityKeys("taskLabels");

export const taskLabelsKeys = {
  ...labelsBase,
} as const;
