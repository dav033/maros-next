"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";
import { STALE_TIMES } from "@/shared/lib/queryClient";

export function useOutstandingBalances(limit: number = 100, leadType?: LeadType) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.outstandingBalances(limit, leadType),
    queryFn: () => ctx.repos.analytics.getOutstandingBalances({ limit, leadType }),
    staleTime: STALE_TIMES.analytics,
  });
}
