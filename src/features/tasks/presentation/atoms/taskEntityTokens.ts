import type { TaskEntityKind, TaskEntityRef } from "@/tasks/domain";

export const TASK_ENTITY_KIND_LABELS: Record<TaskEntityKind, string> = {
  lead: "Lead",
  project: "Project",
  contact: "Contact",
  company: "Company",
};

export function taskEntityFallbackLabel(kind: TaskEntityKind, id: number): string {
  return `${TASK_ENTITY_KIND_LABELS[kind]} #${id}`;
}

export function taskEntityLabel(entity: TaskEntityRef | null, kind: TaskEntityKind | null, id: number | null): string {
  if (entity?.label) return entity.label;
  if (kind && id != null) return taskEntityFallbackLabel(kind, id);
  return "Unlinked";
}
