"use client";

import { useLeadsApp } from "@/di";
import { leadsKeys, listLostLeads } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import { useInstantList } from "@/shared/query";

export type UseInstantLostLeadsResult = {
  leads: Lead[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

export function useInstantLostLeads(
  initialData?: Lead[],
): UseInstantLostLeadsResult {
  const ctx = useLeadsApp();
  const r = useInstantList<Lead>({
    queryKey: leadsKeys.lost(),
    queryFn: () => listLostLeads(ctx),
    initialData,
  });
  return { ...r, leads: r.data };
}
