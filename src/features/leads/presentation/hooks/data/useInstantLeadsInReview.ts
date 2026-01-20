"use client";

import { useQuery } from "@tanstack/react-query";
import { useLeadsApp } from "@/di";
import { leadsKeys, listLeadsInReview } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import { buildInstantQueryResult } from "@/shared/query";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export type UseInstantLeadsInReviewResult = {
  leads: Lead[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};


export function useInstantLeadsInReview(initialData?: Lead[]): UseInstantLeadsInReviewResult {
  const ctx = useLeadsApp();

  const query = useQuery<Lead[], Error>({
    queryKey: leadsKeys.inReview(),
    queryFn: async () => {
      const items = await listLeadsInReview(ctx);
      return items ?? [];
    },
    initialData,
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
