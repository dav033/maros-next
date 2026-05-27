"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useProjectHealth(leadType?: LeadType) {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.projectHealth(leadType),
    queryFn: () => ctx.repos.analytics.getProjectHealth({ leadType }),
  });
}
