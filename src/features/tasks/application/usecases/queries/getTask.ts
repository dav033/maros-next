import type { TasksAppContext } from "@/tasks";
import type { TaskDetail } from "@/tasks/domain";

export async function getTask(ctx: TasksAppContext, id: number): Promise<TaskDetail> {
  return ctx.repos.task.get(id);
}
