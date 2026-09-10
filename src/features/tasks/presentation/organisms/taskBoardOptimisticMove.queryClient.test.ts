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
  it("patches the visible filtered board immediately", async () => {
    const queryClient = new QueryClient();
    const board: TaskBoardResult = {
      columns: { todo: [task(1, "todo")], in_progress: [] },
      doneTotalCount: 12,
    };
    queryClient.setQueryData(tasksKeys.board({}), board);

    await optimisticMoveTask(queryClient, { taskId: 1, toStatus: "in_progress" });

    const patched = queryClient.getQueryData<TaskBoardResult>(tasksKeys.board({}));
    expect(patched?.columns.todo).toEqual([]);
    expect(patched?.columns.in_progress?.map((item) => item.id)).toEqual([1]);
    expect(patched?.doneTotalCount).toBe(12);
  });

  it("restores only its own task", async () => {
    const queryClient = new QueryClient();
    const board: TaskBoardResult = {
      columns: { todo: [task(1, "todo"), task(2, "todo")], in_progress: [] },
      doneTotalCount: 0,
    };
    queryClient.setQueryData(tasksKeys.board({}), board);

    const snapshotA = await optimisticMoveTask(queryClient, { taskId: 1, toStatus: "in_progress" });
    const snapshotB = await optimisticMoveTask(queryClient, { taskId: 2, toStatus: "done" });
    snapshotA.restore();

    const current = queryClient.getQueryData<TaskBoardResult>(tasksKeys.board({}));
    expect(current?.columns.todo?.map((item) => item.id)).toEqual([1]);
    expect(current?.columns.done?.map((item) => item.id)).toEqual([2]);
    snapshotB.restore();
  });

  it("patches every board cache variant under the board prefix", async () => {
    const queryClient = new QueryClient();
    const board: TaskBoardResult = {
      columns: { todo: [task(1, "todo")], in_progress: [] },
      doneTotalCount: 0,
    };
    queryClient.setQueryData(tasksKeys.board({}), board);
    queryClient.setQueryData(tasksKeys.board({ status: ["todo"] }), board);

    await optimisticMoveTask(queryClient, { taskId: 1, toStatus: "in_progress" });

    expect(queryClient.getQueryData<TaskBoardResult>(tasksKeys.board({}))?.columns.in_progress?.map((item) => item.id)).toEqual([1]);
    expect(queryClient.getQueryData<TaskBoardResult>(tasksKeys.board({ status: ["todo"] }))?.columns.todo).toEqual([]);
  });

  it("does nothing when the board is not cached", async () => {
    const queryClient = new QueryClient();
    const snapshot = await optimisticMoveTask(queryClient, { taskId: 1, toStatus: "in_progress" });
    expect(queryClient.getQueryData(tasksKeys.board({}))).toBeUndefined();
    expect(() => snapshot.restore()).not.toThrow();
  });
});
