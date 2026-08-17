import { describe, expect, it } from "vitest";
import type { Task } from "@/tasks/domain";
import { assigneeLoad, groupTasksByAssignee, taskDurationDays, taskIsOnCalendarDay } from "./taskCalendar";

function task(id: number, assignee: Task["assignee"], estimatedHours = 0, startDate = "2026-08-17", dueDate = "2026-08-19"): Task {
  return {
    id, parentId: null, title: `Task ${id}`, kind: "general", status: "todo", priority: "normal", position: id,
    assignee, reporter: null, entityKind: null, entityId: null, entity: null, startDate, dueDate,
    blockedReason: null, completedAt: null, labels: [], subtasksTotal: 0, subtasksDone: 0, commentsCount: 0,
    createdAt: "2026-08-16T00:00:00.000Z", updatedAt: "2026-08-16T00:00:00.000Z", estimatedHours,
  };
}

describe("task calendar model", () => {
  it("groups the week by assignee, including an unassigned row", () => {
    const rows = groupTasksByAssignee([task(1, { id: 2, name: "Zoe", email: "z@x", picture: null }), task(2, null), task(3, { id: 2, name: "Zoe", email: "z@x", picture: null })]);
    expect(rows.map((row) => [row.id, row.tasks.map((item) => item.id)])).toEqual([[null, [2]], [2, [1, 3]]]);
  });

  it("keeps multi-day tasks visible across their inclusive range and preserves duration", () => {
    const item = task(1, null, 0, "2026-08-17", "2026-08-19");
    expect(taskIsOnCalendarDay(item, "2026-08-17")).toBe(true);
    expect(taskIsOnCalendarDay(item, "2026-08-19")).toBe(true);
    expect(taskIsOnCalendarDay(item, "2026-08-20")).toBe(false);
    expect(taskDurationDays(item)).toBe(2);
  });

  it("marks an assignee overloaded above the 40-hour capacity", () => {
    expect(assigneeLoad([task(1, null, 24), task(2, null, 16)]).overloaded).toBe(false);
    expect(assigneeLoad([task(1, null, 40.5)]).overloaded).toBe(true);
    expect(assigneeLoad([task(1, null, 80, "2026-08-17", "2026-08-30")], "2026-08-17", "2026-08-23").hours).toBe(40);
  });
});
