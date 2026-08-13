import type { TasksAppContext } from "@/tasks";
import type { TaskDetail } from "@/tasks/domain";

export async function removeTaskAttachment(
  ctx: TasksAppContext,
  id: number,
  key: string
): Promise<TaskDetail> {
  return ctx.repos.task.removeAttachment(id, key);
}
