import { ArrowDown, ArrowUp, Equal, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/tasks/domain";
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "./taskVisualTokens";

const PRIORITY_ICONS: Record<TaskPriority, LucideIcon> = {
  low: ArrowDown,
  normal: Equal,
  high: ArrowUp,
  urgent: Flame,
};

export function TaskPriorityBadge({
  priority,
  showLabel = true,
  className,
}: {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}) {
  const color = TASK_PRIORITY_COLORS[priority];
  const Icon = PRIORITY_ICONS[priority];

  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs font-medium", className)}
      style={{ color }}
      title={TASK_PRIORITY_LABELS[priority]}
    >
      <Icon className="h-3.5 w-3.5" />
      {showLabel ? TASK_PRIORITY_LABELS[priority] : null}
    </span>
  );
}
