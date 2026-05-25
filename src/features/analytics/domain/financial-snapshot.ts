export type FinancialSnapshot = {
  projectCount: number;
  estimatedTotal: number;
  invoicedTotal: number;
  paidTotal: number;
  outstandingTotal: number;
};

export type AgingBucket = {
  label: string;
  count: number;
  totalBalance: number;
};
