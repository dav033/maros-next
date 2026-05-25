"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsApp } from "@/di";
import { analyticsKeys } from "../keys/analyticsKeys";
import { analyticsQueryDefaults } from "./cacheConfig";

export function useTopClients(limit: number = 5, by: "revenue" | "volume" = "revenue") {
  const ctx = useAnalyticsApp();

  return useQuery({
    ...analyticsQueryDefaults,
    queryKey: analyticsKeys.topClients(limit, by),
    queryFn: () => ctx.repos.analytics.getTopClients({ limit, by }),
  });
}
