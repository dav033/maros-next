"use client";

import { useLeadsApp } from "@/di";
import { leadsKeys, listLeadsInReview } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import { useInstantList } from "@/shared/query";

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

export function useInstantLeadsInReview(
  initialData?: Lead[],
): UseInstantLeadsInReviewResult {
  const ctx = useLeadsApp();
  const r = useInstantList<Lead>({
    queryKey: leadsKeys.inReview(),
    queryFn: () => listLeadsInReview(ctx),
    initialData,
  });
  return { ...r, leads: r.data };
}
