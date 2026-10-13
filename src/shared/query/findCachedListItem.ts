import type { QueryClient, QueryKey } from "@tanstack/react-query";

/** Only scans list-shaped values under a feature's own query namespace. */
export function findCachedListItem<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  matches: (item: T) => boolean,
): T | undefined {
  const queries = queryClient.getQueriesData<readonly T[]>({
    queryKey,
    predicate: (query) => !query.state.isInvalidated && query.state.dataUpdatedAt > 0,
  });
  for (const [, items] of queries) {
    if (!Array.isArray(items)) continue;
    const item = items.find(matches);
    if (item) return item;
  }
  return undefined;
}
