"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { optimizedApiClient } from "@/shared/infra";
// Ruta directa y no el barrel de `@/leads/presentation`: ese arrastra las páginas
// del módulo, que sí usan `@/di`, y este reporte vive deliberadamente fuera del DI.
import {
  useLeadsMutations,
  type UpdateLeadStatusInput,
} from "@/features/leads/presentation/hooks/mutations/useLeadsMutations";
import { analyticsQueryDefaults } from "../../application/queries/cacheConfig";

/**
 * Sin el umbral: los tres (30/60/90) quedan cacheados a la vez, y un lead que
 * deja de estar estancado desaparece de todos, no sólo del que se está mirando.
 */
const STALE_LEADS_KEY = ["analytics", "leads", "stale"] as const;

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
    queryKey: [...STALE_LEADS_KEY, days],
    queryFn: async () => {
      const response = await optimizedApiClient.get<StaleLeadsReport>("/analytics/leads/stale", {
        params: { days },
      });
      return response.data;
    },
  });
}

/**
 * Decidir un lead desde el reporte: una vez en WON o LOST ya no está estancado, así
 * que el reporte se invalida además de las queries de leads que trae la mutación.
 */
export function useCloseStaleLead() {
  const queryClient = useQueryClient();
  const { updateStatusMutation } = useLeadsMutations();

  const close = async (input: UpdateLeadStatusInput) => {
    try {
      await updateStatusMutation.mutateAsync(input);
      void queryClient.invalidateQueries({ queryKey: STALE_LEADS_KEY });
    } catch {
      // Error ya notificado por useEntityMutation
    }
  };

  return {
    close,
    pendingLeadId: updateStatusMutation.isPending
      ? updateStatusMutation.variables?.id ?? null
      : null,
  };
}
