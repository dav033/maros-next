import type {
  InvoiceClassification,
  InvoiceDirection,
  InvoicePaymentStatus,
  InvoiceScan,
  InvoiceScanStatus,
  InvoiceTransactionDirection,
} from "./models";

export const CLASSIFICATION_LABELS: Record<InvoiceClassification, string> = {
  customer_service: "Customer service",
  materials_expense: "Materials",
  subcontractor_expense: "Subcontractor",
  other: "Other",
  unknown: "Unclassified",
};

export const DIRECTION_LABELS: Record<InvoiceDirection, string> = {
  incoming: "Supplier bill",
  outgoing: "Customer invoice",
  unknown: "Unknown",
};

export const PAYMENT_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  unknown: "Unknown",
};

export const TRANSACTION_DIRECTION_LABELS: Record<InvoiceTransactionDirection, string> = {
  payment_made: "Payment made · money out",
  payment_received: "Payment received · money in",
};

export const STATUS_LABELS: Record<InvoiceScanStatus, string> = {
  uploaded: "Awaiting scan",
  processing: "Scanning",
  needs_review: "Ready to enter",
  failed: "Scan failed",
};

export function invoiceTitle(scan: Pick<InvoiceScan, "recordType" | "extractedData" | "fileName">): string {
  if (scan.recordType === "transaction") {
    return scan.extractedData?.description || "Manual transaction";
  }
  const number = scan.extractedData?.invoiceNumber;
  return number ? `Invoice ${number}` : scan.fileName;
}

export function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || ""}`.trim();
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
