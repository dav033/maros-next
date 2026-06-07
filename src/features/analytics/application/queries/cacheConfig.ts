import { keepPreviousData, type QueryClient } from "@tanstack/react-query";
import { analyticsKeys } from "../keys/analyticsKeys";
import { STALE_TIMES } from "@/shared/lib/queryClient";

const STALE_TIME = STALE_TIMES.analytics;
const GC_TIME = 30 * 60 * 1000;

export const analyticsQueryDefaults = {
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchOnMount: false,
  retry: 1,
  placeholderData: keepPreviousData,
} as const;

export function invalidateAnalytics(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
}
