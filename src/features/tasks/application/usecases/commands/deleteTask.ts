import type { TasksAppContext } from "@/tasks";

export async function deleteTask(ctx: TasksAppContext, id: number): Promise<void> {
  return ctx.repos.task.delete(id);
}
