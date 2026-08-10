import type { TasksAppContext } from "@/tasks";
import type { TaskDetail, TaskDraft } from "@/tasks/domain";

export async function createTask(ctx: TasksAppContext, draft: TaskDraft): Promise<TaskDetail> {
  return ctx.repos.task.create(draft);
}
