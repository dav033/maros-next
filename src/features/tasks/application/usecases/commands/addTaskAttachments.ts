import type { TasksAppContext } from "@/tasks";
import type { TaskDetail } from "@/tasks/domain";

export async function addTaskAttachments(
  ctx: TasksAppContext,
  id: number,
  keys: string[]
): Promise<TaskDetail> {
  return ctx.repos.task.addAttachments(id, keys);
}
