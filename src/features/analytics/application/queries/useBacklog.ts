"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";

export function useBacklog(limit: number = 100) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.backlog(limit),
    queryFn: () => ctx.repos.analytics.getBacklog({ limit }),
    staleTime: 5 * 60 * 1000,
  });
}
