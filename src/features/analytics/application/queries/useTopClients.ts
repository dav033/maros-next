"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import type { LeadType } from "@/leads/domain";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useTopClients(
  limit: number = 5,
  by: "revenue" | "volume" = "revenue",
  leadType?: LeadType,
  range?: { from?: string; to?: string },
) {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.topClients(limit, by, range?.from, range?.to, leadType),
    queryFn: () => ctx.repos.analytics.getTopClients({ limit, by, leadType, from: range?.from, to: range?.to }),
  });
}
