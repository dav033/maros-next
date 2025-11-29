import type { UseQueryResult } from "@tanstack/react-query";

export type InstantQueryResult<TData> = {
  data: TData | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  fromCache: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

function hasDataValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value != null;
}

export function buildInstantQueryResult<TData>(
  query: UseQueryResult<TData, Error>,
  fallbackData: TData,
  staleTime: number
): InstantQueryResult<TData> {
  const data = query.data ?? fallbackData;
  const hasData = hasDataValue(query.data);
  const isLoading = query.isPending;
  const isFetching = query.isFetching;
  const showSkeleton = isLoading && !hasData;
  const fromCache =
    hasData && Date.now() - (query.dataUpdatedAt ?? 0) <= staleTime;

  return {
    data,
    hasData,
    isLoading,
    isFetching,
    showSkeleton,
    fromCache,
    error: query.error ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
