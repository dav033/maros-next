"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useFinancialSnapshot() {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.financialSnapshot(),
    queryFn: () => ctx.repos.analytics.getFinancialSnapshot(),
  });
}
