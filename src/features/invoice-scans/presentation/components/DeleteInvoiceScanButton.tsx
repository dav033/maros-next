"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { invoiceTitle } from "../../domain/labels";
import type { InvoiceScan } from "../../domain/models";
import { useDeleteInvoiceScan } from "../hooks/useInvoiceScans";

interface Props {
  scan: Pick<InvoiceScan, "id" | "recordType" | "extractedData" | "fileName" | "enteredAt" | "hasFile">;
  /** Show the word "Delete" next to the icon (detail page); the row uses the icon alone. */
  withLabel?: boolean;
  /** Called once the server confirms the delete, e.g. to leave the detail page. */
  onDeleted?: () => void;
  className?: string;
}

/**
 * Borrar un escaneo o una transacción, con confirmación. El borrado quita el
 * registro de la plataforma y su documento; lo que ya esté asentado en
 * QuickBooks no se toca, y eso es lo que dice el aviso.
 */
export function DeleteInvoiceScanButton({ scan, withLabel, onDeleted, className }: Props) {
  const [open, setOpen] = useState(false);
  const remove = useDeleteInvoiceScan();
  const title = invoiceTitle(scan);
  const busy = remove.isPending;

  async function confirm() {
    try {
      await remove.mutateAsync(scan.id);
      setOpen(false);
      onDeleted?.();
    } catch {
      // El hook ya avisa del error; el diálogo queda abierto para reintentar.
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={withLabel ? "sm" : "icon"}
        className={cn(
          withLabel ? "text-destructive hover:text-destructive" : "size-8 text-muted-foreground hover:text-destructive",
          className,
        )}
        aria-label={withLabel ? undefined : `Delete ${title}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" />
        {withLabel && "Delete"}
      </Button>

      <AlertDialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {scan.hasFile
                ? "The record and the document attached to it are deleted for good. "
                : "The record is deleted for good. "}
              {scan.enteredAt
                ? "Whatever was already entered in QuickBooks stays there; only this entry in the platform goes away."
                : "Nothing is removed from QuickBooks."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirm();
              }}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy && <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
