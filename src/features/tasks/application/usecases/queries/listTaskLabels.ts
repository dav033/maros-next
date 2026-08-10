import type { TasksAppContext } from "@/tasks";
import type { TaskLabel } from "@/tasks/domain";

export async function listTaskLabels(ctx: TasksAppContext): Promise<TaskLabel[]> {
  return ctx.repos.label.list();
}
