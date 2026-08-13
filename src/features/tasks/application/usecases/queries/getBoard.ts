import type { TasksAppContext } from "@/tasks";
import type { TaskBoardResult } from "@/tasks/domain";

export async function getBoard(ctx: TasksAppContext): Promise<TaskBoardResult> {
  return ctx.repos.task.getBoard();
}
