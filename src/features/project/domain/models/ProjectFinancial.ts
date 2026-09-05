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

export interface ProjectPaymentScheduleItem {
  label: string;
  percentage: number;
  amount: number | null;
}

export interface ProjectPaymentSchedule {
  items: ProjectPaymentScheduleItem[];
  totalPercentage: number | null;
  totalAmount: number | null;
  source: {
    attachmentId: string;
    fileName: string;
    entityType: "Estimate" | "Invoice";
    entityId: string;
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






