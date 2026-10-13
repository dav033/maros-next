"use client";

import { useNavigationDetailQuery } from "@/shared/query/useNavigationDetailQuery";
import { useTasksApp } from "@/di";
import { normalizeTaskFilters, tasksKeys, getBoard } from "@/tasks/application";
import type { TaskBoardResult, TaskFilters } from "@/tasks/domain";
import { buildInstantQueryResult } from "@/shared/query";
import { STALE_TIMES } from "@/shared/lib/queryClient";
import type { InitialTasksBoard } from "../../data/loadInitialTasksBoard";

const EMPTY_BOARD: TaskBoardResult = { columns: {}, doneTotalCount: 0 };

export function useInstantTasksBoard(filters?: TaskFilters, initialBoard?: InitialTasksBoard) {
  const ctx = useTasksApp();
  const normalizedFilters = normalizeTaskFilters(filters);
  const normalizedInitialFilters = initialBoard
    ? normalizeTaskFilters(initialBoard.filters)
    : null;
  const matchingInitialBoard =
    initialBoard &&
    JSON.stringify(normalizedFilters) === JSON.stringify(normalizedInitialFilters)
      ? initialBoard
      : undefined;
  const query = useNavigationDetailQuery<TaskBoardResult>({
    queryKey: tasksKeys.board(normalizedFilters),
    queryFn: () => getBoard(ctx, filters),
    initialData: matchingInitialBoard?.data,
    initialDataUpdatedAt: matchingInitialBoard?.updatedAt,
    staleTime: STALE_TIMES.lists,
  });
  const result = buildInstantQueryResult<TaskBoardResult>(query, EMPTY_BOARD, STALE_TIMES.lists);
  const data = result.data ?? EMPTY_BOARD;
  return { ...result, board: data.columns, doneTotalCount: data.doneTotalCount };
}
