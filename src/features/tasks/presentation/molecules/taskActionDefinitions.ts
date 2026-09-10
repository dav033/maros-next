import type { LucideIcon } from "lucide-react";
import { Archive, CheckCircle2, Copy, Expand, Flag, Tags, Trash2 } from "lucide-react";
import { TASK_PRIORITIES, type Task, type TaskPriority } from "@/tasks/domain";
import { TASK_PRIORITY_LABELS } from "../atoms/taskVisualTokens";

export type TaskActionDefinition = {
  id: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onSelect: () => void;
  children?: Array<{ id: string; label: string; selected: boolean; onSelect: () => void }>;
};

export type TaskActionHandlers = {
  onOpen?: () => void;
  onComplete?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onPriorityChange?: (priority: TaskPriority) => void;
  onLabelsClick?: () => void;
  onArchive?: () => void;
};

export function createTaskActionDefinitions(task: Task, handlers: TaskActionHandlers): TaskActionDefinition[] {
  const actions: TaskActionDefinition[] = [];
  if (handlers.onOpen) actions.push({ id: "open", label: "Open detail", icon: Expand, onSelect: handlers.onOpen });
  if (handlers.onComplete && task.status !== "done") {
    actions.push({ id: "complete", label: "Mark done", icon: CheckCircle2, onSelect: handlers.onComplete });
  }
  if (handlers.onPriorityChange) {
    actions.push({
      id: "priority",
      label: "Priority",
      icon: Flag,
      onSelect: () => undefined,
      children: TASK_PRIORITIES.map((priority) => ({
        id: priority,
        label: TASK_PRIORITY_LABELS[priority],
        selected: priority === task.priority,
        onSelect: () => handlers.onPriorityChange?.(priority),
      })),
    });
  }
  if (handlers.onLabelsClick) actions.push({ id: "labels", label: "Edit labels", icon: Tags, onSelect: handlers.onLabelsClick });
  if (handlers.onDuplicate) actions.push({ id: "duplicate", label: "Duplicate", icon: Copy, onSelect: handlers.onDuplicate });
  if (handlers.onArchive) actions.push({ id: "archive", label: "Archive", icon: Archive, onSelect: handlers.onArchive });
  if (handlers.onDelete) actions.push({ id: "delete", label: "Delete", icon: Trash2, destructive: true, onSelect: handlers.onDelete });
  return actions;
}
