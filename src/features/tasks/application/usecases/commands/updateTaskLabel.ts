import type { TasksAppContext } from "@/tasks";
import type { TaskLabel, TaskLabelPatch } from "@/tasks/domain";

export async function updateTaskLabel(
  ctx: TasksAppContext,
  id: number,
  patch: TaskLabelPatch
): Promise<TaskLabel> {
  return ctx.repos.label.update(id, patch);
}
