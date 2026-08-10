import type { TasksAppContext } from "@/tasks";

export async function deleteTaskLabel(ctx: TasksAppContext, id: number): Promise<void> {
  return ctx.repos.label.delete(id);
}
