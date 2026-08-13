import type { TasksAppContext } from "@/tasks";
import type { TaskDetail } from "@/tasks/domain";

export async function reorderTaskAttachments(
  ctx: TasksAppContext,
  id: number,
  keys: string[]
): Promise<TaskDetail> {
  return ctx.repos.task.reorderAttachments(id, keys);
}
