"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";

export function useBacklog(limit: number = 100, leadType?: LeadType) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.backlog(limit, leadType),
    queryFn: () => ctx.repos.analytics.getBacklog({ limit, leadType }),
    staleTime: 5 * 60 * 1000,
  });
}
