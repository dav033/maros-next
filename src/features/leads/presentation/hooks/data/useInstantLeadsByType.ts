"use client";

import { useQuery } from "@tanstack/react-query";
import { useLeadsApp } from "@/di";
import { leadsKeys, listLeadsByType } from "@/leads/application";
import type { Lead, LeadType } from "@/leads/domain";
import { buildInstantQueryResult } from "@/shared/query";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export type UseInstantLeadsByTypeResult = {
  leads: Lead[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};


export function useInstantLeadsByType(type: LeadType): UseInstantLeadsByTypeResult {
  const ctx = useLeadsApp();

  const query = useQuery<Lead[], Error>({
    queryKey: leadsKeys.byType(type),
    queryFn: async () => {
      const items = await listLeadsByType(ctx, type);
      return items ?? [];
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });

  const instant = buildInstantQueryResult<Lead[]>(
    query,
    [],
    DEFAULT_STALE_TIME,
  );

  return {
    leads: instant.data,
    hasData: instant.hasData,
    isLoading: instant.isLoading,
    isFetching: instant.isFetching,
    showSkeleton: instant.showSkeleton,
    fromCache: instant.fromCache,
    error: instant.error,
    refetch: instant.refetch,
  };
}
