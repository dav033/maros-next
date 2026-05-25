export type OutstandingBalanceItem = {
  jobId: string;
  customerName: string;
  projectNumber: string | null;
  totalInvoiced: number;
  totalOutstanding: number;
  invoiceCount: number;
  oldestInvoiceDate: string | null;
};

export type BacklogItem = {
  jobId: string;
  customerName: string;
  projectNumber: string | null;
  estimatedAmount: number;
  invoicedAmount: number;
  backlogAmount: number;
  estimateCount: number;
  invoiceCount: number;
};
