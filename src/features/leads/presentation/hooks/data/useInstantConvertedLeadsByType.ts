"use client";

import { useLeadsApp } from "@/di";
import { leadsKeys, listConvertedLeadsByType } from "@/leads/application";
import type { Lead, LeadType } from "@/leads/domain";
import { useInstantList } from "@/shared/query";

export function useInstantConvertedLeadsByType(type: LeadType, enabled: boolean) {
  const ctx = useLeadsApp();
  const query = useInstantList<Lead>({
    queryKey: leadsKeys.convertedByType(type),
    queryFn: () => listConvertedLeadsByType(ctx, type),
    enabled,
  });
  return { ...query, leads: query.data };
}
