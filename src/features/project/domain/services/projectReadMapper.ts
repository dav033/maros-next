import type { Project } from "../models";
import type { Lead } from "@/leads/domain";
import { ProjectProgressStatus, InvoiceStatus } from "../models";
import type {
  ProjectFinancial,
  ProjectFinancialPayment,
  ProjectPaymentSchedule,
} from "../models/ProjectFinancial";

export type ApiProjectDTO = {
  id?: number | null;
  projectProgressStatus?: string | null;
  invoiceStatus?: string | null;
  overview?: string | null;
  notes?: string[] | null;
  attachments?: string[] | null;
  leadId?: number | null;
  financial?: ProjectFinancial | null;
  qbo?: {
    data?: unknown;
    error?: { code?: string; message?: string } | null;
  } | null;
  client?: {
    id?: number | null;
    type?: "contact" | "company" | null;
    name?: string | null;
    isClient?: boolean;
    isCustomer?: boolean;
  } | null;
  paymentSummary?: {
    count?: number;
    totalAmount?: number;
    lastPaymentDate?: string | null;
    hasDetails?: boolean;
  } | null;
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

function normalizePaymentSchedule(input: unknown): ProjectPaymentSchedule | undefined {
  if (!input || typeof input !== "object") return undefined;
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.items)) return undefined;

  const items = value.items.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    const percentage = typeof item.percentage === "number" ? item.percentage : Number(item.percentage);
    if (typeof item.label !== "string" || !Number.isFinite(percentage)) return [];
    const amount = item.amount == null ? null : Number(item.amount);
    return [{
      label: item.label,
      percentage,
      amount: Number.isFinite(amount) ? amount : null,
    }];
  });
  if (!items.length) return undefined;

  const source = value.source;
  if (!source || typeof source !== "object") return undefined;
  const sourceValue = source as Record<string, unknown>;
  if (
    typeof sourceValue.attachmentId !== "string" ||
    typeof sourceValue.fileName !== "string" ||
    (sourceValue.entityType !== "Estimate" && sourceValue.entityType !== "Invoice") ||
    typeof sourceValue.entityId !== "string"
  ) return undefined;

  const totalPercentage = value.totalPercentage == null ? null : Number(value.totalPercentage);
  const totalAmount = value.totalAmount == null ? null : Number(value.totalAmount);
  return {
    items,
    totalPercentage: Number.isFinite(totalPercentage) ? totalPercentage : null,
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : null,
    source: {
      attachmentId: sourceValue.attachmentId,
      fileName: sourceValue.fileName,
      entityType: sourceValue.entityType,
      entityId: sourceValue.entityId,
    },
  };
}

export function mapProjectFromDTO(dto: ApiProjectDTO, leadMapper: (dto: any) => Lead): Project {
  if (!dto) {
    throw new Error("Project DTO is required");
  }

  const rawId = (dto as { id?: unknown })?.id;
  const parsedId =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string" && rawId.trim() !== ""
        ? Number(rawId)
        : 0;
  const id = Number.isInteger(parsedId) ? parsedId : 0;

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
        paymentSchedule: normalizePaymentSchedule((f as { paymentSchedule?: unknown }).paymentSchedule),
      };
    }
  }
  
  const qboError =
    dto?.qbo?.error && typeof dto.qbo.error.message === "string"
      ? { code: dto.qbo.error.code ?? "qbo_query_failed", message: dto.qbo.error.message }
      : undefined;

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
    qboError,
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

