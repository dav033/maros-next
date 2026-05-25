"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageToolbarCardProps {
  icon?: LucideIcon;
  label?: string;
  resultCount?: number;
  totalCount?: number;
  children: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}

export function PageToolbarCard({
  icon: Icon,
  label,
  resultCount,
  totalCount,
  children,
  rightSlot,
  className,
}: PageToolbarCardProps) {
  const showHeader = Boolean(label || rightSlot || (typeof resultCount === "number" && typeof totalCount === "number"));

  return (
    <div
      className={cn(
        "dashboard-section-enter rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
      style={{ animationDelay: "60ms" }}
    >
      {showHeader ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {label ? <span>{label}</span> : null}
            {typeof resultCount === "number" && typeof totalCount === "number" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2 py-0.5 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                <span className="font-semibold text-foreground">{resultCount}</span>
                <span>of</span>
                <span>{totalCount}</span>
              </span>
            ) : null}
          </div>
          {rightSlot ? <div className="flex flex-wrap items-center gap-2">{rightSlot}</div> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
