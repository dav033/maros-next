import type { TasksAppContext } from "@/tasks";
import type { TaskFilters, TaskListResult } from "@/tasks/domain";

export async function listTasks(ctx: TasksAppContext, filters?: TaskFilters): Promise<TaskListResult> {
  return ctx.repos.task.list(filters);
}
