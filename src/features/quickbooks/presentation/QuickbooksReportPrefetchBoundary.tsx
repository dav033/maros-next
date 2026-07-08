"use client";

import type { ReactNode } from "react";
import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";

type Props = {
  children: ReactNode;
  /** The dehydrated React Query state obtained from server-side prefetching. */
  dehydratedState?: DehydratedState;
};

/**
 * Wraps a QuickBooks report page with server-prefetched React Query state.
 *
 * On the client this renders a `<HydrationBoundary>` which rehydrates the
 * query cache with data fetched on the server (via `createServerApiClient`),
 * avoiding an extra client-side network round-trip for the initial load.
 *
 * @example
 * // In a Server Component:
 * <QuickbooksReportPrefetchBoundary dehydratedState={dehydrate(queryClient)}>
 *   <RevenueReportPage />
 * </QuickbooksReportPrefetchBoundary>
 */
export function QuickbooksReportPrefetchBoundary({ children, dehydratedState }: Props) {
  return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
}
