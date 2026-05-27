"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useOverview(params?: { from?: string; to?: string; leadType?: LeadType }) {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.overview(params?.from, params?.to, params?.leadType),
    queryFn: () => ctx.repos.analytics.getOverview(params),
  });
}
