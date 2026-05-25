"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";

export function useOutstandingBalances(limit: number = 100) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.outstandingBalances(limit),
    queryFn: () => ctx.repos.analytics.getOutstandingBalances({ limit }),
    staleTime: 5 * 60 * 1000,
  });
}
