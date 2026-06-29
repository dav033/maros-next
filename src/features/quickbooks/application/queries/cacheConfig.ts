import { keepPreviousData, type QueryClient } from "@tanstack/react-query";
import { quickbooksKeys } from "../keys/quickbooksKeys";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 15 * 60 * 1000;

export const quickbooksQueryDefaults = {
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: false,
  retry: 1,
  placeholderData: keepPreviousData,
} as const;

export function invalidateQuickbooksProjectAttachments(
  queryClient: QueryClient,
  projectNumber: string,
) {
  return queryClient.invalidateQueries({
    queryKey: [...quickbooksKeys.all, "project-attachments", projectNumber],
  });
}
