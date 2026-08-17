import type { Task } from "@/tasks/domain";

export const CALENDAR_CAPACITY_HOURS = 40;

export type CalendarRow = {
  id: number | null;
  label: string;
  tasks: Task[];
};

export function groupTasksByAssignee(tasks: readonly Task[]): CalendarRow[] {
  const byAssignee = new Map<string, CalendarRow>();
  for (const task of tasks) {
    const id = task.assignee?.id ?? null;
    const key = id == null ? "unassigned" : String(id);
    const row = byAssignee.get(key) ?? {
      id,
      label: task.assignee?.name ?? task.assignee?.email ?? "Unassigned",
      tasks: [],
    };
    row.tasks.push(task);
    byAssignee.set(key, row);
  }
  return Array.from(byAssignee.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function taskIsOnCalendarDay(task: Pick<Task, "startDate" | "dueDate">, dayKey: string): boolean {
  const start = task.startDate ?? task.dueDate;
  const end = task.dueDate ?? task.startDate;
  return start != null && end != null && start <= dayKey && dayKey <= end;
}

export function taskDurationDays(task: Pick<Task, "startDate" | "dueDate">): number {
  if (!task.startDate || !task.dueDate) return 0;
  return Math.max(
    0,
    Math.round(
      (new Date(`${task.dueDate}T00:00:00`).getTime() - new Date(`${task.startDate}T00:00:00`).getTime()) /
        86400000,
    ),
  );
}

export function assigneeLoad(
  tasks: readonly Task[],
  windowStart?: string,
  windowEnd?: string,
): { hours: number; overloaded: boolean } {
  const hours = tasks.reduce((total, task) => {
    const estimated = Number(task.estimatedHours ?? 0);
    if (!windowStart || !windowEnd || estimated === 0) return total + estimated;
    const start = task.startDate ?? task.dueDate;
    const end = task.dueDate ?? task.startDate;
    if (!start || !end) return total + estimated;
    const overlapStart = start > windowStart ? start : windowStart;
    const overlapEnd = end < windowEnd ? end : windowEnd;
    if (overlapStart > overlapEnd) return total;
    const totalDays = taskDurationDays({ startDate: start, dueDate: end }) + 1;
    const overlapDays = taskDurationDays({ startDate: overlapStart, dueDate: overlapEnd }) + 1;
    return total + estimated * (overlapDays / totalDays);
  }, 0);
  return { hours, overloaded: hours > CALENDAR_CAPACITY_HOURS };
}
