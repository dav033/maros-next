import type { TasksAppContext } from "@/tasks";
import type { Task, TaskFilters } from "@/tasks/domain";

export async function listTasks(ctx: TasksAppContext, filters?: TaskFilters): Promise<Task[]> {
  return ctx.repos.task.list(filters);
}
