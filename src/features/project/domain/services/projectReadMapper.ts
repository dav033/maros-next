import type { Project } from "../models";
import type { Lead } from "@/leads/domain";
import { ProjectProgressStatus, InvoiceStatus } from "../models";

export type ApiProjectDTO = {
  id?: number | null;
  invoiceAmount?: number | string | null; // Can be string from decimal type in DB
  payments?: number[] | null;
  projectProgressStatus?: string | null;
  invoiceStatus?: string | null;
  quickbooks?: boolean | null;
  overview?: string | null;
  notes?: string[] | null;
  leadId?: number | null;
  lead?: {
    id?: number | null;
    leadNumber?: string | null;
    name?: string | null;
    startDate?: string | null;
    location?: string | null;
    addressLink?: string | null;
    status?: string | null;
    contact?: {
      id?: number | null;
      name?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
    projectType?: {
      id?: number | null;
      name?: string | null;
      color?: string | null;
    } | null;
  } | null;
} | null;

function resolveProjectProgressStatus(input: unknown): ProjectProgressStatus | undefined {
  if (typeof input === "string") {
    const v = input.trim().toUpperCase();
    if (Object.values(ProjectProgressStatus).includes(v as ProjectProgressStatus)) {
      return v as ProjectProgressStatus;
    }
  }
  return undefined;
}

function resolveInvoiceStatus(input: unknown): InvoiceStatus | undefined {
  if (typeof input === "string") {
    const v = input.trim().toUpperCase();
    if (Object.values(InvoiceStatus).includes(v as InvoiceStatus)) {
      return v as InvoiceStatus;
    }
  }
  return undefined;
}

export function mapProjectFromDTO(dto: ApiProjectDTO, leadMapper: (dto: any) => Lead): Project {
  if (!dto) {
    throw new Error("Project DTO is required");
  }

  const id = dto?.id ?? 0;
  
  // Handle invoiceAmount - can be number or string (from decimal type in DB)
  let invoiceAmount: number | undefined = undefined;
  if (dto?.invoiceAmount !== null && dto?.invoiceAmount !== undefined) {
    if (typeof dto.invoiceAmount === "number") {
      invoiceAmount = dto.invoiceAmount;
    } else if (typeof dto.invoiceAmount === "string") {
      const parsed = parseFloat(dto.invoiceAmount);
      if (!isNaN(parsed)) {
        invoiceAmount = parsed;
      }
    }
  }
  
  const payments = Array.isArray(dto?.payments) ? dto.payments.filter((p): p is number => typeof p === "number") : undefined;
  const projectProgressStatus = resolveProjectProgressStatus(dto?.projectProgressStatus);
  const invoiceStatus = resolveInvoiceStatus(dto?.invoiceStatus);
  const quickbooks = dto?.quickbooks ?? undefined;
  const overview = dto?.overview && dto.overview.trim() !== "" ? dto.overview.trim() : undefined;
  const notes = Array.isArray(dto?.notes) ? dto.notes.filter((n): n is string => typeof n === "string") : [];
  
  const leadId = dto?.leadId ?? dto?.lead?.id ?? 0;
  
  let lead: Lead;
  if (dto?.lead) {
    lead = leadMapper(dto.lead);
  } else {
    throw new Error("Lead is required for Project");
  }

  return {
    id,
    invoiceAmount,
    payments,
    projectProgressStatus,
    invoiceStatus,
    quickbooks,
    overview,
    notes,
    lead,
    leadId,
  };
}

export function mapProjectsFromDTO(list: ApiProjectDTO[], leadMapper: (dto: any) => Lead): Project[] {
  if (!Array.isArray(list)) return [];
  return list.map((dto) => mapProjectFromDTO(dto, leadMapper));
}



