import type { Lead } from "@/leads";
import type { InvoiceStatus, ProjectStatus } from "@/project";

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
