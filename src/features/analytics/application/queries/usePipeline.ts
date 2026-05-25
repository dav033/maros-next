"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function usePipeline() {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.pipeline(),
    queryFn: () => ctx.repos.analytics.getPipeline(),
  });
}
