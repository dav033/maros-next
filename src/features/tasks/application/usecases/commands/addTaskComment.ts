import type { TasksAppContext } from "@/tasks";
import type { TaskComment } from "@/tasks/domain";

export async function addTaskComment(
  ctx: TasksAppContext,
  taskId: number,
  body: Record<string, unknown>
): Promise<TaskComment> {
  return ctx.repos.task.addComment(taskId, body);
}
