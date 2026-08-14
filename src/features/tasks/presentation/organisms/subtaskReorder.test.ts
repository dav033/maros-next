import { describe, expect, it } from "vitest";
import type { Task } from "@/tasks/domain";
import { reorderSubtasks, resolveSubtaskDrop } from "./subtaskReorder";

function sub(id: number): Task {
  return {
    id,
    parentId: 99,
    title: `Subtask ${id}`,
    kind: "general",
    status: "todo",
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

const list = [sub(1), sub(2), sub(3)];

describe("resolveSubtaskDrop", () => {
  it("lands after the target when dragging down", () => {
    expect(resolveSubtaskDrop(list, 1, 3)).toEqual({ afterId: 3 });
  });

  it("lands before the target when dragging up", () => {
    expect(resolveSubtaskDrop(list, 3, 1)).toEqual({ beforeId: 1 });
  });

  it("ignores a drop onto itself", () => {
    expect(resolveSubtaskDrop(list, 2, 2)).toBeNull();
  });

  it("ignores a target that is not in the list", () => {
    expect(resolveSubtaskDrop(list, 1, 42)).toBeNull();
  });
});

describe("reorderSubtasks", () => {
  it("moves a subtask down to the target's slot", () => {
    expect(reorderSubtasks(list, 1, 3).map((s) => s.id)).toEqual([2, 3, 1]);
  });

  it("moves a subtask up to the target's slot", () => {
    expect(reorderSubtasks(list, 3, 1).map((s) => s.id)).toEqual([3, 1, 2]);
  });

  it("returns the list untouched when nothing would move", () => {
    expect(reorderSubtasks(list, 2, 2)).toBe(list);
    expect(reorderSubtasks(list, 1, 42)).toBe(list);
  });
});
