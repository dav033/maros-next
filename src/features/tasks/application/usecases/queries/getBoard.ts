import type { TasksAppContext } from "@/tasks";
import type { TaskBoardColumns } from "@/tasks/domain";

export async function getBoard(ctx: TasksAppContext): Promise<TaskBoardColumns> {
  return ctx.repos.task.getBoard();
}
