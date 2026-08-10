import { cn } from "@/lib/utils";
import type { TaskKind } from "@/tasks/domain";
import { TASK_KIND_ICONS, TASK_KIND_LABELS } from "./taskVisualTokens";

export function TaskKindIcon({
  kind,
  className,
}: {
  kind: TaskKind;
  className?: string;
}) {
  const Icon = TASK_KIND_ICONS[kind];
  return (
    <Icon
      className={cn("h-3.5 w-3.5 text-muted-foreground", className)}
      aria-label={TASK_KIND_LABELS[kind]}
    />
  );
}
