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
export type InvoiceScanRecordType = "invoice" | "transaction";
export type InvoiceTransactionDirection = "payment_made" | "payment_received";
export type QboCounterpartyType = "Vendor" | "Customer";

/** One vendor or customer of QuickBooks, as the counterparty picker lists them. */
export interface QboCounterparty {
  id: string;
  name: string;
  type: QboCounterpartyType;
}

/** What came back from creating a counterparty in QuickBooks and in the CRM. */
export interface CreatedQboCounterparty extends QboCounterparty {
  /** QuickBooks already had this name: it was reused, not duplicated. */
  existedInQuickbooks: boolean;
  crmCompanyId: number;
  existedInCrm: boolean;
  linkedToQuickbooks: boolean;
}

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
  /** Set only when the name was picked from QuickBooks; free text leaves it null. */
  counterpartyId?: string | null;
  counterpartyType?: QboCounterpartyType | null;
  invoiceNumber: string | null;
  issueDate: string | null;
  dueDate: string | null;
  currency: string | null;
  subtotal: number | null;
  taxTotal: number | null;
  total: number | null;
  paymentStatus: InvoicePaymentStatus;
  description?: string | null;
  transactionDirection?: InvoiceTransactionDirection;
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
  recordType?: InvoiceScanRecordType;
  fileName: string;
  /** Si el registro tiene documento original guardado, así que se puede descargar. */
  hasFile?: boolean;
  contentType: string;
  status: InvoiceScanStatus;
  extractedData: ExtractedInvoiceData | null;
  qboSuggestions: QboInvoiceSuggestions;
  errorMessage: string | null;
  projectNumber: string | null;
  /** Free-text note from the reviewer. */
  comments: string | null;
  /** Non-fatal problems the scanner hit; the reviewer should check these fields. */
  warnings: string[];
  /** Set once the invoice was entered in QuickBooks. */
  enteredAt: string | null;
  enteredBy: number | null;
  /** User who last edited the scan; set by the server. */
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
  /** Presigned URL to the original file; only on the detail endpoint, expires in ~15 min. */
  imageUrl?: string;
}

/** Fields a reviewer can correct. Only the keys present are sent; `null` clears a value. */
export interface InvoiceScanPatch {
  projectNumber?: string | null;
  comments?: string | null;
  direction?: InvoiceDirection;
  classification?: InvoiceClassification;
  counterpartyName?: string | null;
  counterpartyId?: string | null;
  counterpartyType?: QboCounterpartyType | null;
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  currency?: string | null;
  subtotal?: number | null;
  taxTotal?: number | null;
  total?: number | null;
  paymentStatus?: InvoicePaymentStatus;
  /** Transacciones manuales: para qué fue el pago. */
  description?: string | null;
  /** Transacciones manuales: si el dinero salió o entró. */
  transactionDirection?: InvoiceTransactionDirection;
  lineItems?: Array<{
    description: string;
    quantity?: number | null;
    unitPrice?: number | null;
    amount?: number | null;
  }>;
  entered?: boolean;
}
