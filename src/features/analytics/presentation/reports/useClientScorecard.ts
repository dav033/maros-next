"use client";

import { useQuery } from "@tanstack/react-query";
import { optimizedApiClient } from "@/shared/infra";
import { analyticsQueryDefaults } from "../../application/queries/cacheConfig";

export type ClientScorecardRow = {
  contactId: number;
  contactName: string | null;
  companyId: number | null;
  companyName: string | null;
  leadCount: number;
  wonCount: number;
  lostCount: number;
  openCount: number;
  /** won+lost: the denominator of closeRate, and the reason it can be absent. */
  decidedCount: number;
  /** Fraction 0–1, not a percentage. `null` means nothing has been decided yet. */
  closeRate: number | null;
  estimatedValueTotal: number;
  estimatedValueWon: number;
  /** "YYYY-MM-DD" */
  lastLeadDate: string | null;
};

/**
 * Repeat-client scorecard. The endpoint already returns the rows ordered
 * (leadCount desc, then won value), so the table never re-sorts them: the order
 * is part of the answer the backend gives.
 */
export function useClientScorecard(limit = 50) {
  return useQuery<ClientScorecardRow[]>({
    ...analyticsQueryDefaults,
    queryKey: ["analytics", "clients", "scorecard", limit],
    queryFn: async () => {
      const response = await optimizedApiClient.get<ClientScorecardRow[]>(
        "/analytics/clients/scorecard",
        { params: { limit } },
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });
}
