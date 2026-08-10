import type { TasksAppContext } from "@/tasks";
import type { Task } from "@/tasks/domain";

export async function getMyTasks(ctx: TasksAppContext): Promise<Record<string, Task[]>> {
  return ctx.repos.task.getMine();
}
