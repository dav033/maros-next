import type {
  InvoiceClassification,
  InvoiceDirection,
  InvoicePaymentStatus,
  InvoiceScan,
  InvoiceScanStatus,
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

export const STATUS_LABELS: Record<InvoiceScanStatus, string> = {
  uploaded: "Awaiting scan",
  processing: "Scanning",
  needs_review: "Ready to enter",
  failed: "Scan failed",
};

export function invoiceTitle(scan: Pick<InvoiceScan, "extractedData" | "fileName">): string {
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
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
