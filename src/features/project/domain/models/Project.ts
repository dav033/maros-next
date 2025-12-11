import type { Lead } from "@/features/leads/domain";
import type { InvoiceStatus } from "../models";
import type { ProjectStatus } from "../types";

export interface Project {
  location: string;
  leadNumber: string;
  customerName: string;
  contactName: string;
  id: number;
  projectName: string;
  overview?: string;
  payments?: number[];
  projectStatus: ProjectStatus;
  invoiceStatus: InvoiceStatus;
  quickbooks?: boolean;
  startDate?: string;
  lead: Lead;
  endDate?: string;
}
