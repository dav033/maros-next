"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { InvoiceScanDropzone } from "./InvoiceScanDropzone";
import { ManualTransactionForm } from "./ManualTransactionForm";

type Mode = "manual" | "scan";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Las dos formas de dar de alta un movimiento viven en la misma ventana: escribir
 * la transacción a mano (con documento opcional) o escanear un documento y dejar
 * que se lean los datos. Antes eran dos botones y dos diálogos distintos, y el
 * de la transacción manual exigía elegir dirección en un control invisible.
 */
export function NewTransactionDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");

  // Volver siempre a la opción por defecto al reabrir: el modo escáner es la
  // excepción, no lo que alguien espera encontrar la próxima vez.
  useEffect(() => {
    if (open) setMode("manual");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">New transaction</DialogTitle>
          <DialogDescription className="text-xs">
            Type the transaction yourself, or scan a document and let it be read. Either
            way it joins the QuickBooks entry queue.
          </DialogDescription>
        </DialogHeader>

        <div
          role="tablist"
          aria-label="How to add the transaction"
          className="grid grid-cols-2 gap-1 rounded-lg bg-elev-3 p-1"
        >
          {(
            [
              { value: "manual", label: "Add transaction" },
              { value: "scan", label: "Scan document" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={mode === tab.value}
              onClick={() => setMode(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === tab.value
                  ? "bg-elev-1 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "manual" ? (
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
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              One document per file. Take a clear photo of the whole page, or choose a
              photo or PDF; the details are read for you and open for review.
            </p>
            <InvoiceScanDropzone
              onScanned={(scan) => {
                onOpenChange(false);
                router.push(`/finance/invoices/${scan.id}`);
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
