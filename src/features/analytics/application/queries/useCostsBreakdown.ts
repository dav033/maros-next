"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useCostsBreakdown(
  params?: { from?: string; to?: string; enabled?: boolean },
) {
  const ctx = useAnalyticsApp();
  const { from, to, enabled = true } = params ?? {};

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.costsBreakdown(from, to),
    queryFn: () => ctx.repos.analytics.getCostsBreakdown({ from, to }),
    enabled,
  });
}
