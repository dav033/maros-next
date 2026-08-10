import type { TasksAppContext } from "@/tasks";
import type { TaskDetail, TaskPatch } from "@/tasks/domain";

export async function updateTask(
  ctx: TasksAppContext,
  id: number,
  patch: TaskPatch
): Promise<TaskDetail> {
  return ctx.repos.task.update(id, patch);
}
