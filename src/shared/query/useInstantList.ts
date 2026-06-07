"use client";

import { type QueryKey, useQuery } from "@tanstack/react-query";

import { STALE_TIMES } from "@/shared/lib/queryClient";

import { buildInstantQueryResult, type InstantQueryResult } from "./instant";

export type InstantListConfig<T> = {
  queryKey: QueryKey;
  queryFn: () => Promise<T[] | null | undefined>;
  enabled?: boolean;
  initialData?: T[];
  staleTime?: number;
  gcTime?: number;
};

/**
 * Centralizes the useQuery + buildInstantQueryResult pattern for list endpoints.
 * Defaults: staleTime = STALE_TIMES.lists, gcTime = 10min, empty-array fallback.
 */
export function useInstantList<T>({
  queryKey,
  queryFn,
  enabled,
  initialData,
  staleTime = STALE_TIMES.lists,
  gcTime = 10 * 60 * 1000,
}: InstantListConfig<T>): InstantQueryResult<T[]> {
  const query = useQuery<T[], Error>({
    queryKey,
    queryFn: async () => (await queryFn()) ?? [],
    initialData,
    enabled,
    staleTime,
    gcTime,
  });

  return buildInstantQueryResult<T[]>(query, [], staleTime);
}
