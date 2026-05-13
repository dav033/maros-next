"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface DetailFieldProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Field label */
  label: string;
  /** Field value — renders empty state if falsy */
  value?: string | number | null;
  /** Custom render for the value area (overrides `value` text) */
  children?: ReactNode;
  /** If value is an email, renders as mailto link */
  isEmail?: boolean;
  /** If value is a URL, renders as external link */
  linkHref?: string;
  /** Text for the external link */
  linkLabel?: string;
  /** Called when the "Add" button is clicked on empty state */
  onAdd?: () => void;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Reusable detail field component that displays a labeled value with an icon,
 * or an empty state placeholder when the value is falsy.
 */
export function DetailField({
  icon: Icon,
  label,
  value,
  children,
  isEmail,
  linkHref,
  linkLabel = "View on map",
  onAdd,
  className,
}: DetailFieldProps) {
  const hasValue = children || (value != null && value !== "");

  if (!hasValue) {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">Not available</p>
          </div>
        </div>
        {onAdd && (
          <Button variant="ghost" size="sm" onClick={onAdd}>
            <Plus className="size-3 mr-1" />
            Add
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {children ? (
          children
        ) : isEmail && typeof value === "string" ? (
          <a
            href={`mailto:${value}`}
            className="text-foreground hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-foreground">{value}</p>
        )}
        {linkHref && (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline mt-1 inline-block"
          >
            {linkLabel}
          </a>
        )}
      </div>
    </div>
  );
}
