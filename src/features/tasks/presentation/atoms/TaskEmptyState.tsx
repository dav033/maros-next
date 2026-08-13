import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared empty state for every "there's nothing here" spot in the tasks feature —
 * board column, list, "My tasks" all-caught-up. The list's version was already the
 * right one (icon + title + supporting line + optional action) — this generalizes
 * it, plus a `compact` variant for the board column's tight placeholder, which never
 * had room for an icon or an action to begin with.
 */
export function TaskEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-border/40 px-2 py-6 text-center text-xs text-muted-foreground",
          className
        )}
      >
        {title}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 p-8 text-center",
        className
      )}
    >
      {Icon ? <Icon className="mb-1 size-10 text-muted-foreground/50" /> : null}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
