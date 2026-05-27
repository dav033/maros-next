"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";

export function useOutstandingBalances(limit: number = 100, leadType?: LeadType) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.outstandingBalances(limit, leadType),
    queryFn: () => ctx.repos.analytics.getOutstandingBalances({ limit, leadType }),
    staleTime: 5 * 60 * 1000,
  });
}
