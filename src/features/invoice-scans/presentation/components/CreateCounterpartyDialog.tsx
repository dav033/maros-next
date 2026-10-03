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

import type { InvoiceDirection, QboCounterparty } from "../../domain/models";
import { useCreateQboCounterparty } from "../hooks/useInvoiceScans";

interface Props {
  /** The typed name waiting for confirmation; null keeps the dialog closed. */
  name: string | null;
  direction: InvoiceDirection;
  onCancel: () => void;
  onCreated: (counterparty: QboCounterparty) => void;
}

/**
 * Confirms creating a counterparty before it happens.
 *
 * QuickBooks has no delete for vendors and customers, only a deactivation, so
 * this is the last point where the person can back out — which is why the
 * wording names the two records and the two places by name rather than asking
 * "are you sure?".
 */
export function CreateCounterpartyDialog({
  name,
  direction,
  onCancel,
  onCreated,
}: Props) {
  const create = useCreateQboCounterparty();
  const busy = create.isPending;
  const kind = direction === "incoming" ? "customer" : "vendor";

  function confirm() {
    if (!name) return;
    create.mutate(
      { name, direction },
      {
        onSuccess: onCreated,
        // El hook ya avisa del error; al cerrar, el nombre escrito sigue en el
        // campo como texto libre, que es lo que ya valía antes de ofrecer crear.
        onError: () => onCancel(),
      },
    );
  }

  return (
    <AlertDialog
      open={name !== null}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This creates two records: a {kind} named “{name}” in QuickBooks, and a
            company named “{name}” in the CRM. QuickBooks never deletes a {kind}, it
            only deactivates it, so this cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
            disabled={busy}
          >
            {busy && (
              <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Create {kind}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
