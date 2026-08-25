import type { Lead } from "@/leads/domain";
import type { ProjectFinancial } from "./models/ProjectFinancial";

// Re-export ProjectFinancial for convenience
export type { ProjectFinancial } from "./models/ProjectFinancial";

export type ProjectClientSummary = {
  id: number;
  type: "contact" | "company";
  name: string;
  isClient: boolean;
  isCustomer: boolean;
} | null;

export type ProjectPaymentSummary = {
  count: number;
  totalAmount: number;
  lastPaymentDate: string | null;
  hasDetails: boolean;
};

export type ProjectPaymentItem = {
  id: string;
  date: string | null;
  amount: number;
  method: string | null;
  reference: string | null;
  linkedInvoices: Array<{ id: string; documentNumber: string | null; amount: number | null }>;
  unappliedAmount: number;
  memo: string | null;
  attachmentCount: number;
  warnings: string[];
};

export type ProjectPaymentsResponse = {
  projectId: number;
  projectNumber: string | null;
  totalAmount: number;
  count: number;
  source: "quickbooks";
  fetchedAt: string;
  items: ProjectPaymentItem[];
};

export enum ProjectProgressStatus {
  NOT_EXECUTED = "NOT_EXECUTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  LOST = "LOST",
  POSTPONED = "POSTPONED",
  PERMITS = "PERMITS",
}

export enum InvoiceStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  NOT_EXECUTED = "NOT_EXECUTED",
  PERMITS = "PERMITS",
}

export interface Project {
  id: number;
  projectProgressStatus?: ProjectProgressStatus;
  invoiceStatus?: InvoiceStatus;
  overview?: string;
  notes: string[];
  attachments?: string[];
  lead: Lead;
  leadId: number;
  startDate?: string;
  endDate?: string;
  financial?: ProjectFinancial;
  client?: ProjectClientSummary;
  paymentSummary?: ProjectPaymentSummary | null;
}

export type ProjectId = number;
export type LeadId = number;

export type ProjectDraft = Readonly<{
  projectProgressStatus?: ProjectProgressStatus;
  overview?: string;
  notes?: string[];
  attachments?: string[];
  leadId: LeadId;
}>;

export type ProjectPatch = Readonly<{
  projectProgressStatus?: ProjectProgressStatus;
  overview?: string;
  notes?: string[];
  attachments?: string[];
  leadId?: LeadId;
  leadName?: string;
  leadNumber?: string;
}>;

