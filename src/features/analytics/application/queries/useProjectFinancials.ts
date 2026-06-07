"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";
import { STALE_TIMES } from "@/shared/lib/queryClient";

export function useProjectFinancials(limit: number = 200, leadType?: LeadType) {
  const ctx = useAnalyticsApp();

  return useQuery({
    queryKey: analyticsKeys.projectFinancials(limit, leadType),
    queryFn: () => ctx.repos.analytics.getProjectFinancials({ limit, leadType }),
    staleTime: STALE_TIMES.analytics,
  });
}
