"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useOverview(params?: { from?: string; to?: string }) {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.overview(params?.from, params?.to),
    queryFn: () => ctx.repos.analytics.getOverview(params),
  });
}
