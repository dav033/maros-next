import type { TasksAppContext } from "@/tasks";
import type { TaskTemplate } from "@/tasks/domain";

export function listTaskTemplates(ctx: TasksAppContext): Promise<TaskTemplate[]> {
  return ctx.repos.task.listTemplates();
}
