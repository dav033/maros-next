import type { TasksAppContext } from "@/tasks";
import type { TaskDetail, TaskEntityLink } from "@/tasks/domain";

export async function setTaskEntity(
  ctx: TasksAppContext,
  id: number,
  link: TaskEntityLink | null
): Promise<TaskDetail> {
  return ctx.repos.task.setEntityLink(id, link);
}
