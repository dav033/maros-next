import type { InvoiceScan } from "./models";

export interface InvoiceScanBuckets {
  /** Not yet entered in QuickBooks, newest first (includes failed and unscanned files). */
  pending: InvoiceScan[];
  /** Marked as entered, most recently entered first. */
  completed: InvoiceScan[];
}

export function partitionInvoiceScans(scans: InvoiceScan[]): InvoiceScanBuckets {
  const pending = scans
    .filter((scan) => !scan.enteredAt)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const completed = scans
    .filter((scan) => !!scan.enteredAt)
    .sort((a, b) => Date.parse(b.enteredAt!) - Date.parse(a.enteredAt!));
  return { pending, completed };
}

/** A scan the reviewer can tick as entered: it has details to enter from. */
export function canMarkEntered(scan: Pick<InvoiceScan, "status">): boolean {
  return scan.status === "needs_review";
}
