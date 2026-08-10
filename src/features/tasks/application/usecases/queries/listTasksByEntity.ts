import type { TasksAppContext } from "@/tasks";
import type { Task } from "@/tasks/domain";

export async function listTasksByEntity(
  ctx: TasksAppContext,
  entityKind: string,
  entityId: number
): Promise<Task[]> {
  return ctx.repos.task.listByEntity(entityKind, entityId);
}
