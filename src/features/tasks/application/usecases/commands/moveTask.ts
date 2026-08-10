import type { TasksAppContext } from "@/tasks";
import type { TaskMoveInput, TaskMoveResult } from "@/tasks/domain";

export async function moveTask(
  ctx: TasksAppContext,
  id: number,
  input: TaskMoveInput
): Promise<TaskMoveResult> {
  return ctx.repos.task.move(id, input);
}
