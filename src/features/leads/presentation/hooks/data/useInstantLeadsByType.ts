"use client";

import { useLeadsApp } from "@/di";
import { leadsKeys, listLeadsByType } from "@/leads/application";
import type { Lead, LeadType } from "@/leads/domain";
import { useInstantList } from "@/shared/query";

export type UseInstantLeadsByTypeResult = {
  leads: Lead[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

export function useInstantLeadsByType(
  type: LeadType,
  initialData?: Lead[],
): UseInstantLeadsByTypeResult {
  const ctx = useLeadsApp();
  const r = useInstantList<Lead>({
    queryKey: leadsKeys.byType(type),
    queryFn: () => listLeadsByType(ctx, type),
    initialData,
  });
  return { ...r, leads: r.data };
}
