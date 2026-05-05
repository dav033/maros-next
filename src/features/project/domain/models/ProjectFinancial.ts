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
}






