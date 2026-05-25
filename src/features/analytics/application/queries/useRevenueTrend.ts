"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

type RevenueTrendParams = {
  months?: number;
  from?: string;
  to?: string;
};

export function useRevenueTrend(params?: RevenueTrendParams) {
  const ctx = useAnalyticsApp();
  const months = params?.months ?? 12;

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.revenueTrend(months, params?.from, params?.to),
    queryFn: () =>
      ctx.repos.analytics.getRevenueTrend({
        months,
        from: params?.from,
        to: params?.to,
      }),
  });
}
