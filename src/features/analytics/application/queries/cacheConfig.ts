import { keepPreviousData, type QueryClient } from "@tanstack/react-query";
import { analyticsKeys } from "../keys/analyticsKeys";

const STALE_TIME = 5 * 60 * 1000;
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
