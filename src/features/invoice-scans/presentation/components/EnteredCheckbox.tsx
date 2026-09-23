"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { InvoiceScan } from "../../domain/models";
import { canMarkEntered } from "../../domain/partition";
import { useSetInvoiceScanEntered } from "../hooks/useInvoiceScans";

interface Props {
  scan: Pick<InvoiceScan, "id" | "status" | "enteredAt">;
  /** Show the "Entered in QuickBooks" text next to the box. */
  withLabel?: boolean;
  className?: string;
}

/** The one-click "this is in QuickBooks now" control, shared by the list and the detail page. */
export function EnteredCheckbox({ scan, withLabel, className }: Props) {
  const mutation = useSetInvoiceScanEntered();
  const entered = !!scan.enteredAt;
  const allowed = entered || canMarkEntered(scan);
  const pendingId = mutation.isPending ? mutation.variables?.id : null;
  const busy = pendingId === scan.id;
  const id = `entered-${scan.id}`;

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 text-sm",
        allowed ? "cursor-pointer" : "cursor-not-allowed text-muted-foreground",
        className,
      )}
      title={allowed ? undefined : "Scan the invoice or enter its details first"}
    >
      <Checkbox
        id={id}
        checked={entered}
        disabled={!allowed || busy}
        aria-label={withLabel ? undefined : "Entered in QuickBooks"}
        onCheckedChange={(checked) =>
          mutation.mutate({ id: scan.id, entered: checked === true })
        }
      />
      {withLabel && <span>Entered in QuickBooks</span>}
    </label>
  );
}
