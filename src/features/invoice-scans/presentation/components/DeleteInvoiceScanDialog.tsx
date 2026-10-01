"use client";

import { LoaderCircle } from "lucide-react";

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

import { invoiceTitle } from "../../domain/labels";
import type { InvoiceScan } from "../../domain/models";
import { useDeleteInvoiceScan } from "../hooks/useInvoiceScans";

export type DeletableScan = Pick<
  InvoiceScan,
  "id" | "recordType" | "extractedData" | "fileName" | "enteredAt" | "hasFile"
>;

interface Props {
  scan: DeletableScan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the server confirms the delete, e.g. to leave the detail page. */
  onDeleted?: () => void;
}

/**
 * La confirmación de borrado, controlada desde fuera: la fila la abre desde su
 * menú de acciones y el detalle desde su botón, y en los dos casos el diálogo
 * vive fuera del control que lo abre (un menú se desmonta al cerrarse y se
 * llevaría el diálogo con él).
 */
export function DeleteInvoiceScanDialog({ scan, open, onOpenChange, onDeleted }: Props) {
  const remove = useDeleteInvoiceScan();
  const title = invoiceTitle(scan);
  const busy = remove.isPending;

  async function confirm() {
    try {
      await remove.mutateAsync(scan.id);
      onOpenChange(false);
      onDeleted?.();
    } catch {
      // El hook ya avisa del error; el diálogo queda abierto para reintentar.
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
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
  );
}
