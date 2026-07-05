"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

type LeadsPerMonthParams = {
  months?: number;
  from?: string;
  to?: string;
  leadType?: LeadType;
};

export function useLeadsPerMonth(params?: LeadsPerMonthParams) {
  const ctx = useAnalyticsApp();
  const months = params?.months ?? 12;

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.leadsPerMonth(months, params?.from, params?.to, params?.leadType),
    queryFn: () =>
      ctx.repos.analytics.getLeadsPerMonth({
        months,
        from: params?.from,
        to: params?.to,
        leadType: params?.leadType,
      }),
  });
}
