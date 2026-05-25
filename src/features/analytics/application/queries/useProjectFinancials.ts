"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";

export function useProjectFinancials(limit: number = 200) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.projectFinancials(limit),
    queryFn: () => ctx.repos.analytics.getProjectFinancials({ limit }),
    staleTime: 5 * 60 * 1000,
  });
}
