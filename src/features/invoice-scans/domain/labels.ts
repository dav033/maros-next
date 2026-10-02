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

export type MoneyFlow = "out" | "in" | "unknown";

/**
 * Qué lado del dinero es la contraparte. La transacción manual lo dice sin
 * ambigüedad en `transactionDirection`. Un documento escaneado solo trae
 * `direction`, que es un tipo de documento y no un flujo: `incoming` es la
 * factura de un proveedor (Maros paga) y `outgoing` una factura a un cliente
 * (Maros cobra). Ese signo puede llegar mal en un comprobante de pago; está
 * documentado en resolveQboLookupSides del backend.
 */
export function moneyFlow(scan: Pick<InvoiceScan, "extractedData">): MoneyFlow {
  const data = scan.extractedData;
  if (!data) return "unknown";
  if (data.transactionDirection) {
    return data.transactionDirection === "payment_made" ? "out" : "in";
  }
  if (data.direction === "incoming") return "out";
  if (data.direction === "outgoing") return "in";
  return "unknown";
}

/** Un rótulo por fila, para no gastar dos columnas en las dos direcciones. */
export const COUNTERPARTY_PREFIX: Record<MoneyFlow, string> = {
  out: "Paid to",
  in: "Received from",
  unknown: "Counterparty",
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
