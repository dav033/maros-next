export type InvoiceScanStatus =
  | "uploaded"
  | "processing"
  | "needs_review"
  | "failed";

export type InvoiceDirection = "outgoing" | "incoming" | "unknown";

export type InvoiceClassification =
  | "customer_service"
  | "materials_expense"
  | "subcontractor_expense"
  | "other"
  | "unknown";

export type InvoicePaymentStatus = "paid" | "unpaid" | "unknown";

export interface InvoiceLineItem {
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
}

export interface ExtractedInvoiceData {
  direction: InvoiceDirection;
  classification: InvoiceClassification;
  counterpartyName: string | null;
  invoiceNumber: string | null;
  issueDate: string | null;
  dueDate: string | null;
  currency: string | null;
  subtotal: number | null;
  taxTotal: number | null;
  total: number | null;
  paymentStatus: InvoicePaymentStatus;
  confidence: number;
  lineItems: InvoiceLineItem[];
}

export interface QboInvoiceSuggestions {
  connected?: boolean;
  suggestionOnly?: boolean;
  transactionType?: "Invoice" | "Bill" | "Purchase" | null;
  counterpartyType?: string | null;
  counterparties?: Array<{ id: string; name: string; confidence: number }>;
  expenseAccounts?: Array<{ id: string; name: string }>;
  serviceItems?: Array<{ id: string; name: string }>;
}

export interface InvoiceScan {
  id: string;
  fileName: string;
  contentType: string;
  status: InvoiceScanStatus;
  extractedData: ExtractedInvoiceData | null;
  qboSuggestions: QboInvoiceSuggestions;
  errorMessage: string | null;
  projectNumber: string | null;
  /** Non-fatal problems the scanner hit; the reviewer should check these fields. */
  warnings: string[];
  /** Set once the invoice was entered in QuickBooks. */
  enteredAt: string | null;
  enteredBy: number | null;
  createdAt: string;
  updatedAt: string;
  /** Presigned URL to the original file; only on the detail endpoint, expires in ~15 min. */
  imageUrl?: string;
}

/** Fields a reviewer can correct. Only the keys present are sent; `null` clears a value. */
export interface InvoiceScanPatch {
  projectNumber?: string | null;
  direction?: InvoiceDirection;
  classification?: InvoiceClassification;
  counterpartyName?: string | null;
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  currency?: string | null;
  subtotal?: number | null;
  taxTotal?: number | null;
  total?: number | null;
  paymentStatus?: InvoicePaymentStatus;
  lineItems?: Array<{
    description: string;
    quantity?: number | null;
    unitPrice?: number | null;
    amount?: number | null;
  }>;
  entered?: boolean;
}
