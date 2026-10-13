"use client";

import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";

export function shouldRefetchNavigationOnMount(query: { state: { isInvalidated: boolean } }) {
  return query.state.isInvalidated;
}

/** Navigation reuses a complete detail, while mutations can still invalidate it. */
export function useNavigationDetailQuery<T>(
  options: UseQueryOptions<T, Error, T, QueryKey>,
) {
  return useQuery({
    ...options,
    refetchOnMount: options.refetchOnMount ?? shouldRefetchNavigationOnMount,
  });
}
