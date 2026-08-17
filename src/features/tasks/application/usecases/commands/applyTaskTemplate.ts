import type { TasksAppContext } from "@/tasks";
import type { TaskDetail } from "@/tasks/domain";

export function applyTaskTemplate(
  ctx: TasksAppContext,
  templateId: number,
  leadId: number,
  startDate?: string,
): Promise<TaskDetail[]> {
  return ctx.repos.task.applyTemplate(templateId, leadId, startDate);
}
