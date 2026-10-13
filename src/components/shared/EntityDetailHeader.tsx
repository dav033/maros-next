"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedEntityName } from "./SharedEntityName";

export interface EntityDetailHeaderProps {
  /** Main title text */
  title: ReactNode;
  /** Optional subtitle below the title */
  subtitle?: ReactNode;
  /** Optional matching name transition from a route that links to this entity. */
  sharedNameLayoutId?: string;
  identifier?: ReactNode;
  sharedIdentifierLayoutId?: string;
  /** Right-side actions (badges, buttons, etc.) */
  actions?: ReactNode;
}

/**
 * Reusable header for entity detail pages with back navigation.
 */
export function EntityDetailHeader({
  title,
  subtitle,
  sharedNameLayoutId,
  identifier,
  sharedIdentifierLayoutId,
  actions,
}: EntityDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" aria-label="Volver" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          {identifier && <p className="mb-1 font-mono text-sm text-muted-foreground">{sharedIdentifierLayoutId ? <SharedEntityName layoutId={sharedIdentifierLayoutId} transitionRole="detail">{identifier}</SharedEntityName> : identifier}</p>}
          <h1 className="min-w-0 break-words text-2xl font-bold text-foreground [overflow-wrap:anywhere] sm:text-3xl">
            {sharedNameLayoutId ? (
              <SharedEntityName layoutId={sharedNameLayoutId} transitionRole="detail">{title}</SharedEntityName>
            ) : title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div>}
    </div>
  );
}
