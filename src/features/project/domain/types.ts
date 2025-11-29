export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export type ProjectId = number;
export type LeadId = number;

export type ProjectDraft = {
  projectName: string;
  location: string;
  leadNumber: string;
  customerName: string;
  contactName: string;
  projectStatus: ProjectStatus;
  invoiceStatus: InvoiceStatus;
  leadId: LeadId;
};

export type ProjectPatch = Partial<ProjectDraft>;
