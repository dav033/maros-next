export type OverviewResponse = {
  leadsCount?: number;
  projectsCount?: number;
  wonLeadsCount?: number;
  lostLeadsCount?: number;
  winRate?: number;
  revenueTotal?: number;
  outstandingTotal?: number;
  backlogTotal?: number;
  revenuePipelineTotal?: number;
};

export type PipelineBucketResponse = {
  status?: string;
  count?: number;
  estimatedValue?: number;
};

export type ProjectsStatusBucketResponse = {
  status?: string;
  count?: number;
};

export type FinancialSnapshotResponse = {
  projectCount?: number;
  estimatedTotal?: number;
  invoicedTotal?: number;
  paidTotal?: number;
  outstandingTotal?: number;
};

export type AgingBucketResponse = {
  label?: string;
  count?: number;
  totalBalance?: number;
};

export type RevenuePointResponse = {
  month?: string;
  revenue?: number;
};

export type TopClientResponse = {
  jobId?: string;
  customerName?: string;
  projectNumber?: string | null;
  totalInvoiced?: number;
  totalPaid?: number;
  totalOutstanding?: number;
  invoiceCount?: number;
};

export type OutstandingBalanceItemResponse = {
  jobId?: string;
  customerName?: string;
  projectNumber?: string | null;
  totalInvoiced?: number;
  totalOutstanding?: number;
  invoiceCount?: number;
  oldestInvoiceDate?: string | null;
};

export type BacklogItemResponse = {
  jobId?: string;
  customerName?: string;
  projectNumber?: string | null;
  estimatedAmount?: number;
  invoicedAmount?: number;
  backlogAmount?: number;
  estimateCount?: number;
  invoiceCount?: number;
};

export type QuickbooksReportRowResponse = {
  reportName?: string;
  section?: string;
  group?: string;
  label?: string;
  columns?: Record<string, string>;
  amount?: number;
  entityId?: string;
  depth?: number;
  path?: string[];
};

export type QuickbooksParsedReportResponse = {
  reportName?: string;
  rows?: QuickbooksReportRowResponse[];
  summary?: Record<string, number>;
  coverage?: {
    start?: string;
    end?: string;
    dateChunks?: Array<{ start?: string; end?: string }>;
  };
};

export type ProjectFinancialItemResponse = {
  projectNumber?: string;
  found?: boolean;
  estimatedAmount?: number;
  estimateCount?: number;
  invoicedAmount?: number;
  invoiceCount?: number;
  paidAmount?: number;
  outstandingAmount?: number;
  paidPercentage?: number;
  estimateVsInvoicedDelta?: number;
};

export type ProjectHealthResponse = {
  projectId?: number;
  projectNumber?: string;
  projectName?: string;
  status?: string;
  grossMarginPercent?: number;
  backlogAmount?: number;
  riskLevel?: string;
  reasons?: unknown[];
};

export type ExpensesSummaryResponse = {
  totalExpenses?: number;
  totalCogs?: number;
  period?: {
    from?: string;
    to?: string;
  };
};

export type RefreshResponse = {
  ok?: boolean;
};
