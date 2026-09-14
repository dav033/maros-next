export type InvoiceScanStatus =
  | "uploaded"
  | "processing"
  | "needs_review"
  | "failed";

export type InvoiceClassification =
  | "customer_service"
  | "materials_expense"
  | "subcontractor_expense"
  | "other"
  | "unknown";

export interface ExtractedInvoiceData {
  direction: "outgoing" | "incoming" | "unknown";
  classification: InvoiceClassification;
  counterpartyName: string | null;
  invoiceNumber: string | null;
  issueDate: string | null;
  dueDate: string | null;
  currency: string | null;
  subtotal: number | null;
  taxTotal: number | null;
  total: number | null;
  paymentStatus: "paid" | "unpaid" | "unknown";
  confidence: number;
  lineItems: Array<{
    description: string;
    quantity: number | null;
    unitPrice: number | null;
    amount: number | null;
  }>;
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
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}
