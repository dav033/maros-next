import type { Lead } from "@/leads/domain";

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
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: ProjectProgressStatus;
  invoiceStatus?: InvoiceStatus;
  quickbooks?: boolean;
  overview?: string;
  notes: string[];
  lead: Lead;
  leadId: number;
  startDate?: string;
  endDate?: string;
}

export type ProjectId = number;
export type LeadId = number;

export type ProjectDraft = Readonly<{
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: ProjectProgressStatus;
  invoiceStatus?: InvoiceStatus;
  quickbooks?: boolean;
  overview?: string;
  notes?: string[];
  leadId: LeadId;
}>;

export type ProjectPatch = Readonly<{
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: ProjectProgressStatus;
  invoiceStatus?: InvoiceStatus;
  quickbooks?: boolean;
  overview?: string;
  notes?: string[];
  leadId?: LeadId;
}>;



