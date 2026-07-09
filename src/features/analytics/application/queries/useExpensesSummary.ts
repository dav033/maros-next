"use client";

import { useQuery } from "@tanstack/react-query";
import type { LeadType } from "@/leads/domain";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useExpensesSummary(
  params?: { from?: string; to?: string; leadType?: LeadType; enabled?: boolean },
) {
  const ctx = useAnalyticsApp();
  const { from, to, leadType, enabled = true } = params ?? {};

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.expensesSummary(from, to, leadType),
    queryFn: () => ctx.repos.analytics.getExpensesSummary({ from, to, leadType }),
    enabled,
  });
}
