import type { TasksAppContext } from "@/tasks";
import type { TaskBoardResult, TaskFilters } from "@/tasks/domain";

export async function getBoard(ctx: TasksAppContext, filters?: TaskFilters): Promise<TaskBoardResult> {
  return ctx.repos.task.getBoard(filters);
}
