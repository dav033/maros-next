import type { TasksAppContext } from "@/tasks";
import type { Task } from "@/tasks/domain";

export async function listTasksByEntity(
  ctx: TasksAppContext,
  entityKind: string,
  entityId: number
): Promise<Task[]> {
  return ctx.repos.task.listByEntity(entityKind, entityId);
}

export async function listTasksByParty(
  ctx: TasksAppContext,
  partyKind: "company" | "contact",
  partyId: number,
): Promise<Task[]> {
  return ctx.repos.task.listByParty(partyKind, partyId);
}
