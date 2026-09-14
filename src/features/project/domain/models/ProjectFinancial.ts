import type { InvoiceStatus, ProjectPaymentSummary } from "../models";

/**
 * Financial information for a project from n8n webhook
 */
export interface ProjectFinancialPayment {
  id?: string;
  date?: string;
  amount: number;
  method?: string;
  reference?: string;
  linkedInvoice?: string;
}

/**
 * Sobre qué monto se calcula un porcentaje. Los proposals de Maros usan hitos
 * tipo "35% of Remaining Balance", que no son una fracción del estimate.
 */
export type ProjectPaymentScheduleBasis = "total" | "remaining-balance";

export interface ProjectPaymentScheduleItem {
  label: string;
  /** null en hitos de monto fijo ("Fixed Amount $5,000.00"). */
  percentage: number | null;
  amount: number | null;
  basis?: ProjectPaymentScheduleBasis;
}

export interface ProjectPaymentSchedule {
  items: ProjectPaymentScheduleItem[];
  totalPercentage: number | null;
  totalAmount: number | null;
  basis: ProjectPaymentScheduleBasis;
  source: {
    attachmentId: string;
    fileName: string;
    entityType: "Estimate" | "Invoice" | "Customer" | null;
    entityId: string | null;
    /** 'file-name' es heurístico: hay proposals mal nombrados en QuickBooks. */
    matchedBy: "estimate" | "invoice" | "customer" | "file-name";
  };
}

export interface ProjectFinancial {
  projectNumber: string;
  estimatedAmount: number;
  estimateCount: number;
  invoicedAmount: number;
  invoiceCount: number;
  paidAmount: number;
  outstandingAmount: number;
  paidPercentage: number;
  estimateVsInvoicedDelta: number;
  totalJobCost?: number;
  grossProfit?: number;
  payments?: ProjectFinancialPayment[];
  paymentSchedule?: ProjectPaymentSchedule;
}

/** One row of GET /projects/financials — merged into a Project client-side by id. */
export interface ProjectFinancialsEntry {
  id: number;
  financial: ProjectFinancial | null;
  /** Resumen de pagos de QuickBooks: alimenta la columna "Payments". */
  paymentSummary?: ProjectPaymentSummary | null;
  /** Derivado por el backend a partir de invoiced/outstanding: alimenta el filtro y el agrupado por invoice. */
  invoiceStatus?: InvoiceStatus;
  qboError?: { code: string; message: string };
}






