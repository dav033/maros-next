"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";

export function useQuickbooksRevenueReport(params?: { from?: string; to?: string }) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.quickbooksRevenueReport(params?.from, params?.to),
    queryFn: () =>
      ctx.repos.analytics.getQuickbooksRevenueReport({
        from: params?.from,
        to: params?.to,
      }),
    staleTime: 5 * 60 * 1000,
  });
}
