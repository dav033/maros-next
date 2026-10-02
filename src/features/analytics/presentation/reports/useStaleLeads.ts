"use client";

import { useQuery } from "@tanstack/react-query";
import { optimizedApiClient } from "@/shared/infra";
import { analyticsQueryDefaults } from "../../application/queries/cacheConfig";

export type StaleLeadStatus =
  | "NEW_LEAD"
  | "CONTACTED"
  | "ESTIMATING_PREPARING_PROPOSAL"
  | "PROPOSAL_SENT"
  | "FOLLOW_UP"
  | null;

export type StaleLeadAgeBucket = "0-29" | "30-59" | "60-89" | "90-179" | "180-364" | "365+";

export type StaleLead = {
  id: number;
  leadNumber: string | null;
  name: string | null;
  status: StaleLeadStatus;
  /** 0 when the lead carries no estimate at all. */
  estimate: number;
  ageDays: number;
  ageBucket: StaleLeadAgeBucket;
};

export type StaleLeadsSummary = {
  totalCount: number;
  totalEstimate: number;
  /** All six buckets, zeros included, so the shape of the pipeline stays comparable. */
  buckets: Array<{ bucket: string; count: number; estimate: number }>;
  /** Undecided leads with no start date: they are NOT in `leads` nor in `buckets`. */
  undatedCount: number;
  undatedEstimate: number;
};

export type StaleLeadsReport = {
  days: number;
  asOf: string;
  leads: StaleLead[];
  summary: StaleLeadsSummary;
};

export function useStaleLeads(days: number) {
  return useQuery<StaleLeadsReport>({
    // keepPreviousData comes with these defaults: switching 30/60/90 keeps the last
    // table on screen instead of collapsing the page into a skeleton each time.
    ...analyticsQueryDefaults,
    queryKey: ["analytics", "leads", "stale", days],
    queryFn: async () => {
      const response = await optimizedApiClient.get<StaleLeadsReport>("/analytics/leads/stale", {
        params: { days },
      });
      return response.data;
    },
  });
}
