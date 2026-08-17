"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useTasksApp } from "@/di";
import { tasksKeys, listTasks } from "@/tasks/application";
import type { TaskFilters, TaskListResult } from "@/tasks/domain";
import { STALE_TIMES } from "@/shared/lib/queryClient";

const EMPTY_LIST: TaskListResult = { items: [], totalCount: 0, nextCursor: null };

/**
 * Not built on the shared useInstantList (which assumes a bare-array response) —
 * GET /tasks now returns { items, totalCount } so the toolbar can tell "that's
 * everything" apart from "there's more, narrow with a filter" — see TaskListResult.
 */
export function useInstantTasksList(filters?: TaskFilters) {
  const ctx = useTasksApp();
  const query = useInfiniteQuery<TaskListResult, Error>({
    queryKey: tasksKeys.list(filters),
    queryFn: ({ pageParam }) =>
      listTasks(ctx, {
        ...filters,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
        limit: filters?.limit ?? 50,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: STALE_TIMES.lists,
  });
  const pages = query.data?.pages ?? [];
  const data = pages.length > 0 ? pages : [EMPTY_LIST];
  const tasks = data.flatMap((page) => page.items);
  const totalCount = pages[0]?.totalCount ?? 0;
  const hasData = tasks.length > 0;
  const fromCache = hasData && Date.now() - query.dataUpdatedAt <= STALE_TIMES.lists;
  return {
    data: pages[0] ?? EMPTY_LIST,
    hasData,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    showSkeleton: query.isPending && !hasData,
    fromCache,
    error: query.error ?? null,
    refetch: async () => {
      await query.refetch();
    },
    tasks,
    totalCount,
    hasNextPage: query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    isLoadingMore: query.isFetchingNextPage,
  };
}
