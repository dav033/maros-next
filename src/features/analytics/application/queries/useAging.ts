"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useAging() {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.aging(),
    queryFn: () => ctx.repos.analytics.getAging(),
  });
}
