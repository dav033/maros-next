import { describe, expect, it } from "vitest";
import type { Task, TaskPersonRef, TaskStatus } from "@/tasks/domain";
import { groupTasksByAssignee } from "./taskBoardAssigneeGroups";

const alice: TaskPersonRef = { id: 1, name: "Alice", email: "alice@marosconstruction.com", picture: null };
const bob: TaskPersonRef = { id: 2, name: null, email: "bob@marosconstruction.com", picture: null };

function task(id: number, status: TaskStatus, assignee: TaskPersonRef | null): Task {
  return {
    id,
    parentId: null,
    title: `Task ${id}`,
    kind: "general",
    status,
    priority: "normal",
    position: id * 1000,
    assignee,
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

describe("groupTasksByAssignee", () => {
  it("buckets tasks by assignee and status", () => {
    const board = {
      todo: [task(1, "todo", alice), task(2, "todo", null)],
      in_progress: [task(3, "in_progress", alice)],
    };

    const groups = groupTasksByAssignee(board);

    const aliceGroup = groups.find((g) => g.key === 1);
    expect(aliceGroup?.total).toBe(2);
    expect(aliceGroup?.columns.todo?.map((t) => t.id)).toEqual([1]);
    expect(aliceGroup?.columns.in_progress?.map((t) => t.id)).toEqual([3]);

    const unassignedGroup = groups.find((g) => g.key === "unassigned");
    expect(unassignedGroup?.total).toBe(1);
  });

  it("sorts unassigned last and named assignees alphabetically", () => {
    const board = {
      todo: [task(1, "todo", bob), task(2, "todo", alice), task(3, "todo", null)],
    };

    const groups = groupTasksByAssignee(board);

    expect(groups.map((g) => g.key)).toEqual([1, 2, "unassigned"]);
  });

  it("returns an empty list for an empty board", () => {
    expect(groupTasksByAssignee({})).toEqual([]);
  });
});
