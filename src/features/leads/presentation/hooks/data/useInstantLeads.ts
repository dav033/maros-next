"use client";

import { useLeadsApp } from "@/di";
import { leadsKeys, listLeads } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import { useInstantList } from "@/shared/query";

export type UseInstantLeadsResult = {
  leads: Lead[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

/** Every lead regardless of type — see useInstantLeadsByType for the per-page lists. */
export function useInstantLeads(
  initialData?: Lead[],
  options?: { enabled?: boolean },
): UseInstantLeadsResult {
  const ctx = useLeadsApp();
  const r = useInstantList<Lead>({
    queryKey: leadsKeys.list(),
    queryFn: () => listLeads(ctx),
    initialData,
    enabled: options?.enabled,
  });
  return { ...r, leads: r.data };
}
