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
    <div className="dashboard-section-enter flex flex-wrap items-center gap-3 rounded-2xl border border-primary bg-primary-container px-4 py-3 shadow-sm">
      {/* La barra es una superficie primary-container, así que sus hijos van en
          on-container: el hover gris de `ghost` (accent = elev-5) sobre verde
          rendía 1.22:1 y se veía como una mancha. on-primary-container da
          9.27:1 sobre el contenedor. */}
      <span className="text-sm font-medium text-primary-on-container">
        {count} selected
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="gap-1.5 text-primary-on-container hover:bg-primary-on-container/15 hover:text-primary-on-container"
      >
        <X className="h-3.5 w-3.5" />
        Clear
      </Button>
    </div>
  );
}
