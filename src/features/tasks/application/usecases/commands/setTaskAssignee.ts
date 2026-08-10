import type { TasksAppContext } from "@/tasks";
import type { TaskDetail } from "@/tasks/domain";

export async function setTaskAssignee(
  ctx: TasksAppContext,
  id: number,
  userId: number | null
): Promise<TaskDetail> {
  return ctx.repos.task.setAssignee(id, userId);
}
