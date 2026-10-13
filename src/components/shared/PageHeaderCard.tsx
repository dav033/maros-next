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
        "min-w-0 rounded-2xl border border-line bg-elev-1 p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-container text-primary-on-container">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h1 className="min-w-0 break-words font-display text-2xl font-semibold tracking-tight text-balance [overflow-wrap:anywhere]">
              {title}
            </h1>
            {description ? (
              <p className="min-w-0 text-sm text-muted-foreground [overflow-wrap:anywhere]">{description}</p>
            ) : null}
          </div>
        </div>

        {rightSlot ? <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">{rightSlot}</div> : null}
      </div>

      {belowSlot ? <div className="mt-4 min-w-0">{belowSlot}</div> : null}

      {metaSlot ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">{metaSlot}</div>
      ) : null}
    </header>
  );
}
