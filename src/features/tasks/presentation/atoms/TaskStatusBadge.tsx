import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/tasks/domain";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "./taskVisualTokens";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const color = TASK_STATUS_COLORS[status];

  return (
    <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}
