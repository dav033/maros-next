import type { TasksAppContext } from "@/tasks";
import type { TaskComment } from "@/tasks/domain";

export async function updateTaskComment(
  ctx: TasksAppContext,
  taskId: number,
  commentId: number,
  body: Record<string, unknown>
): Promise<TaskComment> {
  return ctx.repos.task.updateComment(taskId, commentId, body);
}
