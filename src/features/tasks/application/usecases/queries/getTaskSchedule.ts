import type { TasksAppContext } from "@/tasks";
import type { Task, TaskScheduleFilters } from "@/tasks/domain";

export async function getTaskSchedule(ctx: TasksAppContext, filters: TaskScheduleFilters): Promise<Task[]> {
  return ctx.repos.task.schedule(filters);
}
