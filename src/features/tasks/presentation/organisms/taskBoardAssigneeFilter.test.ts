import { describe, expect, it } from "vitest";
import type { Task, TaskPersonRef } from "@/tasks/domain";
import { matchesAssigneeFilter } from "./taskBoardAssigneeFilter";

const person: TaskPersonRef = { id: 7, name: "Alice", email: "alice@marosconstruction.com", picture: null };

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    parentId: null,
    title: "Task",
    kind: "general",
    status: "todo",
    priority: "normal",
    position: 1000,
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
    ...overrides,
  };
}

describe("matchesAssigneeFilter", () => {
  it("shows everything when the filter is empty", () => {
    expect(matchesAssigneeFilter(task(), new Set())).toBe(true);
    expect(matchesAssigneeFilter(task({ assignee: person }), new Set())).toBe(true);
  });

  it("matches unassigned tasks only via the 'unassigned' key", () => {
    const filter = new Set<number | "unassigned">(["unassigned"]);
    expect(matchesAssigneeFilter(task(), filter)).toBe(true);
    expect(matchesAssigneeFilter(task({ assignee: person }), filter)).toBe(false);
  });

  it("matches assigned tasks by user id", () => {
    const filter = new Set<number | "unassigned">([7]);
    expect(matchesAssigneeFilter(task({ assignee: person }), filter)).toBe(true);
    expect(matchesAssigneeFilter(task({ assignee: { ...person, id: 8 } }), filter)).toBe(false);
    expect(matchesAssigneeFilter(task(), filter)).toBe(false);
  });

  it("matches on any key present when several are selected", () => {
    const filter = new Set<number | "unassigned">([7, "unassigned"]);
    expect(matchesAssigneeFilter(task(), filter)).toBe(true);
    expect(matchesAssigneeFilter(task({ assignee: person }), filter)).toBe(true);
    expect(matchesAssigneeFilter(task({ assignee: { ...person, id: 9 } }), filter)).toBe(false);
  });
});
