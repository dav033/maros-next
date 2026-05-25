export type RevenuePoint = {
  month: string;
  revenue: number;
};

export type TopClient = {
  jobId: string;
  customerName: string;
  projectNumber: string | null;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
};
