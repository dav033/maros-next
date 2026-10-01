"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DeleteInvoiceScanDialog, type DeletableScan } from "./DeleteInvoiceScanDialog";

interface Props {
  scan: DeletableScan;
  /** Called once the server confirms the delete, e.g. to leave the detail page. */
  onDeleted?: () => void;
  className?: string;
}

/** Borrar desde la ficha de un documento. En la lista esto vive en el menú de la fila. */
export function DeleteInvoiceScanButton({ scan, onDeleted, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("text-destructive hover:text-destructive", className)}
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" />
        Delete
      </Button>

      <DeleteInvoiceScanDialog
        scan={scan}
        open={open}
        onOpenChange={setOpen}
        onDeleted={onDeleted}
      />
    </>
  );
}
