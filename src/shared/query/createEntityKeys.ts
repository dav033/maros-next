import type { QueryKey } from "@tanstack/react-query";

export type EntityId = string | number;

export type EntityKeys<TFilters = unknown> = {
  readonly all: QueryKey;
  readonly lists: () => QueryKey;
  readonly list: (filters?: TFilters) => QueryKey;
  readonly details: () => QueryKey;
  readonly detail: (id: EntityId) => QueryKey;
};

export function createEntityKeys<TFilters = unknown>(
  entity: string,
): EntityKeys<TFilters> {
  const all = [entity] as const;
  return {
    all,
    lists: () => [...all, "list"] as const,
    list: (filters?: TFilters) =>
      filters === undefined
        ? ([...all, "list"] as const)
        : ([...all, "list", filters] as const),
    details: () => [...all, "detail"] as const,
    detail: (id: EntityId) => [...all, "detail", id] as const,
  };
}
