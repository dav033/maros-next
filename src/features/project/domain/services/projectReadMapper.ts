import type { Project } from "../models";
import type { Lead } from "@/leads/domain";
import { ProjectProgressStatus, InvoiceStatus } from "../models";
import type { ProjectFinancial, ProjectFinancialPayment } from "../models/ProjectFinancial";

export type ApiProjectDTO = {
  id?: number | null;
  projectProgressStatus?: string | null;
  invoiceStatus?: string | null;
  overview?: string | null;
  notes?: string[] | null;
  attachments?: string[] | null;
  leadId?: number | null;
  financial?: ProjectFinancial | null;
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

function normalizeFinancialPayments(input: unknown): ProjectFinancialPayment[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const normalized: ProjectFinancialPayment[] = [];
  for (const row of input) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;

    const amountRaw = rec.amount;
    const amount =
      typeof amountRaw === "number"
        ? amountRaw
        : typeof amountRaw === "string"
          ? parseFloat(amountRaw)
          : NaN;

    if (!Number.isFinite(amount)) continue;

    normalized.push({
      id: typeof rec.id === "string" ? rec.id : undefined,
      date: typeof rec.date === "string" ? rec.date : undefined,
      amount,
      method: typeof rec.method === "string" ? rec.method : undefined,
      reference: typeof rec.reference === "string" ? rec.reference : undefined,
      linkedInvoice:
        typeof rec.linkedInvoice === "string" ? rec.linkedInvoice : undefined,
    });
  }

  return normalized.length > 0 ? normalized : undefined;
}

export function mapProjectFromDTO(dto: ApiProjectDTO, leadMapper: (dto: any) => Lead): Project {
  if (!dto) {
    throw new Error("Project DTO is required");
  }

  const id = dto?.id ?? 0;

  const projectProgressStatus = resolveProjectProgressStatus(dto?.projectProgressStatus);
  const invoiceStatus = resolveInvoiceStatus(dto?.invoiceStatus);
  const overview = dto?.overview && dto.overview.trim() !== "" ? dto.overview.trim() : undefined;
  const notes = Array.isArray(dto?.notes) ? dto.notes.filter((n): n is string => typeof n === "string") : [];
  const attachments = Array.isArray(dto?.attachments)
    ? dto.attachments.filter((a): a is string => typeof a === "string")
    : [];


  // Map financial information if present
  let financial: ProjectFinancial | undefined = undefined;
  if (dto?.financial) {
    const f = dto.financial;
    if (
      typeof f.projectNumber === "string" &&
      typeof f.estimatedAmount === "number" &&
      typeof f.estimateCount === "number" &&
      typeof f.invoicedAmount === "number" &&
      typeof f.invoiceCount === "number" &&
      typeof f.paidAmount === "number" &&
      typeof f.outstandingAmount === "number" &&
      typeof f.paidPercentage === "number" &&
      typeof f.estimateVsInvoicedDelta === "number"
    ) {
      financial = {
        projectNumber: f.projectNumber,
        estimatedAmount: f.estimatedAmount,
        estimateCount: f.estimateCount,
        invoicedAmount: f.invoicedAmount,
        invoiceCount: f.invoiceCount,
        paidAmount: f.paidAmount,
        outstandingAmount: f.outstandingAmount,
        paidPercentage: f.paidPercentage,
        estimateVsInvoicedDelta: f.estimateVsInvoicedDelta,
        payments: normalizeFinancialPayments((f as { payments?: unknown }).payments),
      };
    }
  }
  
  const leadId = dto?.leadId ?? dto?.lead?.id ?? 0;
  
  let lead: Lead;
  if (dto?.lead) {
    lead = leadMapper(dto.lead);
  } else {
    throw new Error("Lead is required for Project");
  }

  return {
    id,
    projectProgressStatus,
    invoiceStatus,
    overview,
    notes,
    attachments,
    lead,
    leadId,
    financial,
  };
}

export function mapProjectsFromDTO(list: ApiProjectDTO[], leadMapper: (dto: any) => Lead): Project[] {
  if (!Array.isArray(list)) return [];
  const results: Project[] = [];
  for (const dto of list) {
    try {
      results.push(mapProjectFromDTO(dto, leadMapper));
    } catch (err) {
      console.warn("[mapProjectsFromDTO] Skipping project due to mapping error:", err);
    }
  }
  return results;
}

