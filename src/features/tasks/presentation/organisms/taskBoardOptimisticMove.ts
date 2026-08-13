import type { QueryClient } from "@tanstack/react-query";
import { tasksKeys } from "@/tasks/application";
import { BOARD_STATUSES } from "@/tasks/domain";
import type { Task, TaskBoardColumns, TaskBoardResult, TaskStatus } from "@/tasks/domain";
import type { Snapshot } from "@/shared/query/optimistic";

export interface OptimisticMoveInput {
  taskId: number;
  toStatus: TaskStatus;
  beforeId?: number;
  afterId?: number;
}

/**
 * Moves a task between (or within) board columns in an already-cached
 * `TaskBoardColumns`, without touching `position` — the true position is
 * server-computed (computeInsertPosition), so this only reorders the cached array to
 * match what the drop visually implied. The eventual `invalidateQueries` on success
 * (or SSE-driven refetch from someone else's move) reconciles with the server's real
 * order shortly after; this just closes the gap between "the drop" and "the network
 * round trip" so the card doesn't snap back before landing.
 *
 * Pure and framework-free on purpose — see optimisticMoveTask for the QueryClient
 * wiring around it.
 */
export function applyOptimisticMove(board: TaskBoardColumns, input: OptimisticMoveInput): TaskBoardColumns {
  let moved: Task | undefined;
  const withoutTask: TaskBoardColumns = {};

  for (const status of BOARD_STATUSES) {
    const column = board[status] ?? [];
    const idx = column.findIndex((t) => t.id === input.taskId);
    if (idx === -1) {
      withoutTask[status] = column;
      continue;
    }
    moved = column[idx];
    withoutTask[status] = [...column.slice(0, idx), ...column.slice(idx + 1)];
  }

  // The task isn't in the cached board at all (e.g. this is the very first load, or
  // it was filtered/paginated out) — nothing to optimistically reorder.
  if (!moved) return board;

  const patchedTask: Task = moved.status === input.toStatus ? moved : { ...moved, status: input.toStatus };
  const targetColumn = withoutTask[input.toStatus] ?? [];
  const insertIndex = resolveInsertIndex(targetColumn, input.beforeId, input.afterId);
  const nextTargetColumn = [
    ...targetColumn.slice(0, insertIndex),
    patchedTask,
    ...targetColumn.slice(insertIndex),
  ];

  return { ...withoutTask, [input.toStatus]: nextTargetColumn };
}

function resolveInsertIndex(column: Task[], beforeId?: number, afterId?: number): number {
  if (afterId != null) {
    const idx = column.findIndex((t) => t.id === afterId);
    return idx === -1 ? column.length : idx + 1;
  }
  if (beforeId != null) {
    const idx = column.findIndex((t) => t.id === beforeId);
    return idx === -1 ? column.length : idx;
  }
  return column.length;
}

/** QueryClient wiring for applyOptimisticMove — snapshot, patch, and a restore callback for onError. */
export function optimisticMoveTask(queryClient: QueryClient, input: OptimisticMoveInput): Snapshot {
  const key = tasksKeys.board();
  void queryClient.cancelQueries({ queryKey: key });

  const previous = queryClient.getQueryData<TaskBoardResult>(key);
  if (previous) {
    queryClient.setQueryData<TaskBoardResult>(key, {
      ...previous,
      columns: applyOptimisticMove(previous.columns, input),
    });
  }

  return {
    restore: () => {
      queryClient.setQueryData(key, previous);
    },
  };
}
