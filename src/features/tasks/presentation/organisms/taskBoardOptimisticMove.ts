import type { QueryClient } from "@tanstack/react-query";
import { normalizeTaskFilters, tasksKeys } from "@/tasks/application";
import { BOARD_STATUSES } from "@/tasks/domain";
import type { Task, TaskBoardColumns, TaskBoardResult, TaskFilters, TaskStatus } from "@/tasks/domain";
import type { Snapshot } from "@/shared/query/optimistic";

export interface OptimisticMoveInput {
  taskId: number;
  toStatus: TaskStatus;
  beforeId?: number;
  afterId?: number;
}

/** Move a cached board row without changing its server-computed position. */
export function applyOptimisticMove(board: TaskBoardColumns, input: OptimisticMoveInput): TaskBoardColumns {
  let moved: Task | undefined;
  const withoutTask: TaskBoardColumns = {};

  for (const status of BOARD_STATUSES) {
    const column = board[status] ?? [];
    const index = column.findIndex((task) => task.id === input.taskId);
    if (index < 0) {
      withoutTask[status] = column;
      continue;
    }
    moved = column[index];
    withoutTask[status] = [...column.slice(0, index), ...column.slice(index + 1)];
  }

  if (!moved) return board;
  const patchedTask = moved.status === input.toStatus ? moved : { ...moved, status: input.toStatus };
  const targetColumn = withoutTask[input.toStatus] ?? [];
  const insertIndex = resolveInsertIndex(targetColumn, input.beforeId, input.afterId);
  return {
    ...withoutTask,
    [input.toStatus]: [
      ...targetColumn.slice(0, insertIndex),
      patchedTask,
      ...targetColumn.slice(insertIndex),
    ],
  };
}

function resolveInsertIndex(column: Task[], beforeId?: number, afterId?: number): number {
  if (afterId != null) {
    const index = column.findIndex((task) => task.id === afterId);
    return index < 0 ? column.length : index + 1;
  }
  if (beforeId != null) {
    const index = column.findIndex((task) => task.id === beforeId);
    return index < 0 ? column.length : index;
  }
  return column.length;
}

function findTask(board: TaskBoardResult, taskId: number): Task | undefined {
  for (const status of BOARD_STATUSES) {
    const task = board.columns[status]?.find((item) => item.id === taskId);
    if (task) return task;
  }
  return undefined;
}

function filtersFromKey(key: readonly unknown[]): TaskFilters {
  const filters = key[2];
  return filters && typeof filters === "object" ? normalizeTaskFilters(filters as TaskFilters) : {};
}

/** Evaluate only membership rules available on a board row. */
function matchesKnownFilters(task: Task, filters: TaskFilters): boolean {
  if (filters.status?.length && !filters.status.includes(task.status)) return false;
  if (filters.assigneeUserId?.length && (!task.assignee || !filters.assigneeUserId.includes(task.assignee.id))) return false;
  if (filters.kind?.length && !filters.kind.includes(task.kind)) return false;
  if (filters.priority?.length && !filters.priority.includes(task.priority)) return false;
  if (filters.labelId?.length && !task.labels.some((label) => filters.labelId?.includes(label.id))) return false;
  if (filters.entityKind && task.entityKind !== filters.entityKind) return false;
  if (filters.entityId != null && task.entityId !== filters.entityId) return false;
  if (filters.dueBefore && (!task.dueDate || task.dueDate > filters.dueBefore)) return false;
  if (filters.dueOn && task.dueDate !== filters.dueOn) return false;
  if (filters.includeSubtasks === false && task.parentId) return false;
  if (filters.workspaceId != null && task.workspaceId !== filters.workspaceId) return false;
  if (filters.folderId != null && task.folderId !== filters.folderId) return false;
  return true;
}

/**
 * Snapshot/patch every visible board variant. Rollback removes only this move's
 * row and restores its original column, so a concurrent move of another row stays.
 */
export async function optimisticMoveTask(queryClient: QueryClient, input: OptimisticMoveInput): Promise<Snapshot> {
  const boardPrefix = tasksKeys.board();
  await queryClient.cancelQueries({ queryKey: boardPrefix });

  const caches = queryClient
    .getQueriesData<TaskBoardResult>({ queryKey: boardPrefix })
    .flatMap(([key, board]) => {
      const moved = board ? findTask(board, input.taskId) : undefined;
      return board && moved ? [{ key, board, moved, filters: filtersFromKey(key) }] : [];
    });

  for (const { key, board, filters } of caches) {
    const patched = applyOptimisticMove(board.columns, input);
    const moved = findTask(board, input.taskId);
    if (!moved) continue;
    const nextTask = moved.status === input.toStatus ? moved : { ...moved, status: input.toStatus };
    if (!matchesKnownFilters(nextTask, filters)) {
      patched[input.toStatus] = (patched[input.toStatus] ?? []).filter((task) => task.id !== input.taskId);
    }
    // `q` may match description text absent from board rows. Preserve current
    // search membership and let the server revalidate it after the move.
    queryClient.setQueryData<TaskBoardResult>(key, { ...board, columns: patched });
  }

  return {
    restore: () => {
      for (const { key, board, moved, filters } of caches) {
        const current = queryClient.getQueryData<TaskBoardResult>(key);
        if (!current) continue;
        const currentTask = findTask(current, input.taskId);
        if (currentTask && currentTask.updatedAt !== moved.updatedAt) continue;

        const columns: TaskBoardColumns = {};
        for (const status of BOARD_STATUSES) {
          columns[status] = (current.columns[status] ?? []).filter((task) => task.id !== input.taskId);
        }
        const originalColumn = columns[moved.status] ?? [];
        const originalIndex = (board.columns[moved.status] ?? []).findIndex((task) => task.id === input.taskId);
        const insertAt = originalIndex < 0 ? originalColumn.length : Math.min(originalIndex, originalColumn.length);
        columns[moved.status] = [
          ...originalColumn.slice(0, insertAt),
          moved,
          ...originalColumn.slice(insertAt),
        ].filter((task) => matchesKnownFilters(task, filters));
        queryClient.setQueryData<TaskBoardResult>(key, { ...current, columns });
      }
    },
  };
}
