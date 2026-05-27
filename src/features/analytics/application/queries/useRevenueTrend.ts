"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

type RevenueTrendParams = {
  months?: number;
  from?: string;
  to?: string;
  leadType?: LeadType;
};

export function useRevenueTrend(params?: RevenueTrendParams) {
  const ctx = useAnalyticsApp();
  const months = params?.months ?? 12;

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.revenueTrend(months, params?.from, params?.to, params?.leadType),
    queryFn: () =>
      ctx.repos.analytics.getRevenueTrend({
        months,
        from: params?.from,
        to: params?.to,
        leadType: params?.leadType,
      }),
  });
}
