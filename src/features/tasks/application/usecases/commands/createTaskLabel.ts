import type { TasksAppContext } from "@/tasks";
import type { TaskLabel, TaskLabelDraft } from "@/tasks/domain";

export async function createTaskLabel(
  ctx: TasksAppContext,
  draft: TaskLabelDraft
): Promise<TaskLabel> {
  return ctx.repos.label.create(draft);
}
