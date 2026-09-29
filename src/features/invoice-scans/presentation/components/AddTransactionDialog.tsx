"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ManualTransactionForm } from "./ManualTransactionForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Records a payment without leaving the list. The mutation already refreshes
 * the list cache, so the new row appears behind the dialog as it closes.
 */
export function AddTransactionDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Add a transaction</DialogTitle>
          <DialogDescription className="text-xs">
            Record a payment without uploading a document. It joins the QuickBooks entry queue.
          </DialogDescription>
        </DialogHeader>

        <ManualTransactionForm
          idPrefix="transaction-dialog"
          onCreated={() => onOpenChange(false)}
          cancelSlot={
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
