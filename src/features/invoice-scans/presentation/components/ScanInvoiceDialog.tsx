"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { InvoiceScanDropzone } from "./InvoiceScanDropzone";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Scans a document from the list. A fresh scan usually needs a look, so the
 * dialog closes and opens the scan; the list behind it is refreshed either way.
 */
export function ScanInvoiceDialog({ open, onOpenChange }: Props) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Scan a document</DialogTitle>
          <DialogDescription className="text-xs">
            One document per file. Take a clear photo of the whole page, or choose a photo or PDF.
          </DialogDescription>
        </DialogHeader>

        <InvoiceScanDropzone
          onScanned={(scan) => {
            onOpenChange(false);
            router.push(`/finance/invoices/${scan.id}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
