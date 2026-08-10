import type { TasksAppContext } from "@/tasks";

export async function deleteTaskComment(
  ctx: TasksAppContext,
  taskId: number,
  commentId: number
): Promise<void> {
  return ctx.repos.task.deleteComment(taskId, commentId);
}
