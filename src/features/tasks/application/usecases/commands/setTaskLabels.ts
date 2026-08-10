import type { TasksAppContext } from "@/tasks";
import type { TaskDetail } from "@/tasks/domain";

export async function setTaskLabels(
  ctx: TasksAppContext,
  id: number,
  labelIds: number[]
): Promise<TaskDetail> {
  return ctx.repos.task.setLabels(id, labelIds);
}
