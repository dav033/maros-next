import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type Snapshot = {
  restore: () => void;
};

type EntityWithId<TId> = { id?: TId };

function snapshotAndCancel(
  queryClient: QueryClient,
  keys: QueryKey[],
): { entries: Array<[QueryKey, unknown]>; restore: () => void } {
  const entries: Array<[QueryKey, unknown]> = [];
  for (const key of keys) {
    void queryClient.cancelQueries({ queryKey: key });
    const data = queryClient.getQueryData(key);
    entries.push([key, data]);
  }
  return {
    entries,
    restore: () => {
      for (const [key, data] of entries) {
        queryClient.setQueryData(key, data);
      }
    },
  };
}

export type OptimisticInsertOptions<T> = {
  listKey: QueryKey;
  item: T;
  position?: "start" | "end";
};

export function optimisticInsert<T>(
  queryClient: QueryClient,
  { listKey, item, position = "start" }: OptimisticInsertOptions<T>,
): Snapshot {
  const { restore } = snapshotAndCancel(queryClient, [listKey]);
  queryClient.setQueryData<T[] | undefined>(listKey, (prev) => {
    const list = prev ?? [];
    return position === "start" ? [item, ...list] : [...list, item];
  });
  return { restore };
}

export type OptimisticUpdateOptions<T, TId extends EntityId> = {
  listKey?: QueryKey;
  detailKey?: QueryKey;
  id: TId;
  patch: Partial<T>;
};

type EntityId = string | number;

export function optimisticUpdate<T extends EntityWithId<TId>, TId extends EntityId>(
  queryClient: QueryClient,
  { listKey, detailKey, id, patch }: OptimisticUpdateOptions<T, TId>,
): Snapshot {
  const keys: QueryKey[] = [];
  if (listKey) keys.push(listKey);
  if (detailKey) keys.push(detailKey);
  const { restore } = snapshotAndCancel(queryClient, keys);

  if (listKey) {
    queryClient.setQueryData<T[] | undefined>(listKey, (prev) =>
      prev?.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }
  if (detailKey) {
    queryClient.setQueryData<T | undefined>(detailKey, (prev) =>
      prev ? { ...prev, ...patch } : prev,
    );
  }
  return { restore };
}

export type OptimisticRemoveOptions<TId extends EntityId> = {
  listKey: QueryKey;
  detailKey?: QueryKey;
  id: TId;
};

export function optimisticRemove<T extends EntityWithId<TId>, TId extends EntityId>(
  queryClient: QueryClient,
  { listKey, detailKey, id }: OptimisticRemoveOptions<TId>,
): Snapshot {
  const keys: QueryKey[] = [listKey];
  if (detailKey) keys.push(detailKey);
  const { restore } = snapshotAndCancel(queryClient, keys);

  queryClient.setQueryData<T[] | undefined>(listKey, (prev) =>
    prev?.filter((row) => row.id !== id),
  );
  if (detailKey) {
    queryClient.removeQueries({ queryKey: detailKey });
  }
  return { restore };
}
