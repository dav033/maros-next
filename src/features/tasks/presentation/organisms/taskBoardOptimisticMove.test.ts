import { describe, expect, it } from "vitest";
import type { Task, TaskBoardColumns } from "@/tasks/domain";
import { applyOptimisticMove } from "./taskBoardOptimisticMove";

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

describe("applyOptimisticMove", () => {
  it("moves a task from one column to another, appending by default", () => {
    const board: TaskBoardColumns = {
      todo: [task(1, "todo"), task(2, "todo")],
      in_progress: [task(3, "in_progress")],
    };

    const result = applyOptimisticMove(board, { taskId: 1, toStatus: "in_progress" });

    expect(result.todo?.map((t) => t.id)).toEqual([2]);
    expect(result.in_progress?.map((t) => t.id)).toEqual([3, 1]);
    expect(result.in_progress?.find((t) => t.id === 1)?.status).toBe("in_progress");
  });

  it("inserts before the given beforeId within the target column", () => {
    const board: TaskBoardColumns = {
      todo: [task(1, "todo")],
      in_progress: [task(2, "in_progress"), task(3, "in_progress")],
    };

    const result = applyOptimisticMove(board, { taskId: 1, toStatus: "in_progress", beforeId: 3 });

    expect(result.in_progress?.map((t) => t.id)).toEqual([2, 1, 3]);
  });

  it("inserts after the given afterId within the target column", () => {
    const board: TaskBoardColumns = {
      todo: [task(1, "todo")],
      in_progress: [task(2, "in_progress"), task(3, "in_progress")],
    };

    const result = applyOptimisticMove(board, { taskId: 1, toStatus: "in_progress", afterId: 2 });

    expect(result.in_progress?.map((t) => t.id)).toEqual([2, 1, 3]);
  });

  it("reorders within the same column — the common drag interaction", () => {
    const board: TaskBoardColumns = {
      todo: [task(1, "todo"), task(2, "todo"), task(3, "todo")],
    };

    // Drag task 1 to land after task 2 — "move down one slot".
    const result = applyOptimisticMove(board, { taskId: 1, toStatus: "todo", afterId: 2 });

    expect(result.todo?.map((t) => t.id)).toEqual([2, 1, 3]);
  });

  it("leaves the board untouched when the task isn't in the cached board at all", () => {
    const board: TaskBoardColumns = { todo: [task(1, "todo")] };

    const result = applyOptimisticMove(board, { taskId: 999, toStatus: "in_progress" });

    expect(result).toBe(board);
  });

  it("does not mutate the status field when the column doesn't actually change (pure reorder)", () => {
    const board: TaskBoardColumns = { todo: [task(1, "todo"), task(2, "todo")] };
    const original = board.todo?.[0];

    const result = applyOptimisticMove(board, { taskId: 1, toStatus: "todo", afterId: 2 });

    // Same object reference — no unnecessary clone when status is unchanged.
    expect(result.todo?.find((t) => t.id === 1)).toBe(original);
  });

  it("falls back to appending when beforeId/afterId points at a card that isn't in the target column", () => {
    const board: TaskBoardColumns = {
      todo: [task(1, "todo")],
      in_progress: [task(2, "in_progress")],
    };

    const result = applyOptimisticMove(board, { taskId: 1, toStatus: "in_progress", beforeId: 999 });

    expect(result.in_progress?.map((t) => t.id)).toEqual([2, 1]);
  });
});
