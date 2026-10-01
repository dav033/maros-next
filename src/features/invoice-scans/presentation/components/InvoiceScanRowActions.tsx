"use client";

import { Download, LoaderCircle, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { invoiceTitle } from "../../domain/labels";
import type { InvoiceScan } from "../../domain/models";
import { useDownloadInvoiceScanFile } from "../hooks/useInvoiceScans";
import { DeleteInvoiceScanDialog } from "./DeleteInvoiceScanDialog";

/**
 * Descargar y borrar detrás de un solo botón: dos iconos por fila costaban
 * ancho en una tabla que ya tenía demasiadas columnas.
 */
export function InvoiceScanRowActions({ scan }: { scan: InvoiceScan }) {
  const [confirming, setConfirming] = useState(false);
  const download = useDownloadInvoiceScanFile();
  const busy = download.isPending && download.variables === scan.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label={`Actions for ${invoiceTitle(scan)}`}
          >
            {busy ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <MoreVertical aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {scan.hasFile && (
            <DropdownMenuItem onSelect={() => download.mutate(scan.id)}>
              <Download aria-hidden="true" />
              Download document
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirming(true)}
          >
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteInvoiceScanDialog
        scan={scan}
        open={confirming}
        onOpenChange={setConfirming}
      />
    </>
  );
}
