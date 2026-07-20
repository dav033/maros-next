"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BulkActionsBarProps {
  count: number;
  onClear: () => void;
  children: ReactNode;
}

// Barra de acciones en lote: aparece cuando hay filas seleccionadas en una
// EntityTable con `selection`. Mismo lenguaje visual que PageToolbarCard
// (misma forma de card, mismo radio, mismo motion de entrada).
export function BulkActionsBar({ count, onClear, children }: BulkActionsBarProps) {
  if (count === 0) return null;

  return (
    <div className="dashboard-section-enter flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-foreground">
        {count} selected
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
        Clear
      </Button>
    </div>
  );
}
