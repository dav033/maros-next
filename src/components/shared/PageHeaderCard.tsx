"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  rightSlot?: ReactNode;
  belowSlot?: ReactNode;
  metaSlot?: ReactNode;
  className?: string;
}

export function PageHeaderCard({
  icon: Icon,
  title,
  description,
  rightSlot,
  belowSlot,
  metaSlot,
  className,
}: PageHeaderCardProps) {
  return (
    <header
      className={cn(
        "dashboard-section-enter rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>

        {rightSlot ? <div className="flex flex-wrap items-center gap-2">{rightSlot}</div> : null}
      </div>

      {belowSlot ? <div className="mt-5">{belowSlot}</div> : null}

      {metaSlot ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">{metaSlot}</div>
      ) : null}
    </header>
  );
}
