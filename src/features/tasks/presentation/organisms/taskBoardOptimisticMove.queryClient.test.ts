import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { tasksKeys } from "@/tasks/application";
import type { Task, TaskBoardResult } from "@/tasks/domain";
import { optimisticMoveTask } from "./taskBoardOptimisticMove";

function task(id: number, status: Task["status"]): Task {
  return {
    id,
    parentId: null,
    title: `Task ${id}`,
    kind: "general",
    status,
    priority: "normal",
    position: id * 1000,
    assignee: null,
    reporter: null,
    entityKind: null,
    entityId: null,
    entity: null,
    startDate: null,
    dueDate: null,
    blockedReason: null,
    completedAt: null,
    labels: [],
    subtasksTotal: 0,
    subtasksDone: 0,
    commentsCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("optimisticMoveTask", () => {
  it("patches the cached board immediately, leaving doneTotalCount untouched", () => {
    const queryClient = new QueryClient();
    const board: TaskBoardResult = {
      columns: { todo: [task(1, "todo")], in_progress: [] },
      doneTotalCount: 12,
    };
    queryClient.setQueryData(tasksKeys.board(), board);

    optimisticMoveTask(queryClient, { taskId: 1, toStatus: "in_progress" });

    const patched = queryClient.getQueryData<TaskBoardResult>(tasksKeys.board());
    expect(patched?.columns.todo).toEqual([]);
    expect(patched?.columns.in_progress?.map((t) => t.id)).toEqual([1]);
    expect(patched?.doneTotalCount).toBe(12);
  });

  it("restore() puts the pre-move board back — the rollback path on a failed move", () => {
    const queryClient = new QueryClient();
    const board: TaskBoardResult = {
      columns: { todo: [task(1, "todo")], in_progress: [] },
      doneTotalCount: 12,
    };
    queryClient.setQueryData(tasksKeys.board(), board);

    const snapshot = optimisticMoveTask(queryClient, { taskId: 1, toStatus: "in_progress" });
    snapshot.restore();

    const restored = queryClient.getQueryData<TaskBoardResult>(tasksKeys.board());
    expect(restored).toEqual(board);
  });

  it("is a no-op when the board isn't cached yet — nothing to patch or restore", () => {
    const queryClient = new QueryClient();

    const snapshot = optimisticMoveTask(queryClient, { taskId: 1, toStatus: "in_progress" });

    expect(queryClient.getQueryData(tasksKeys.board())).toBeUndefined();
    expect(() => snapshot.restore()).not.toThrow();
  });
});
