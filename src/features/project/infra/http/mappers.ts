import type { Project, ProjectDraft, ProjectPatch, ProjectClientSummary, ProjectPaymentSummary, ProjectFinancialsEntry } from "@/project/domain";
import type { ProjectFinancial } from "@/project/domain/models/ProjectFinancial";
import type { ApiProjectDTO } from "@/project/domain/services/projectReadMapper";
import { InvoiceStatus, mapProjectFromDTO, mapProjectsFromDTO } from "@/project/domain";
import { mapLeadFromDTO } from "@/leads/domain/services/leadReadMapper";

export type CreateProjectPayload = {
  projectProgressStatus?: string;
  overview?: string;
  leadId: number;
  attachments?: string[];
};

export type UpdateProjectPayload = {
  projectProgressStatus?: string;
  overview?: string;
  leadId?: number;
  leadName?: string;
  leadNumber?: string;
  notes?: string[];
  attachments?: string[];
};

function mapClient(input: unknown): ProjectClientSummary {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  if (typeof value.id !== "number" || (value.type !== "contact" && value.type !== "company") || typeof value.name !== "string") return null;
  return {
    id: value.id,
    type: value.type,
    name: value.name,
    isClient: value.isClient === true,
    isCustomer: value.isCustomer === true,
  };
}

function mapPaymentSummary(input: unknown): ProjectPaymentSummary | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  return {
    count: typeof value.count === "number" ? value.count : 0,
    totalAmount: typeof value.totalAmount === "number" ? value.totalAmount : 0,
    lastPaymentDate: typeof value.lastPaymentDate === "string" ? value.lastPaymentDate : null,
    hasDetails: value.hasDetails !== false,
  };
}

function resolveInvoiceStatus(input: unknown): InvoiceStatus | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim().toUpperCase();
  return Object.values(InvoiceStatus).includes(value as InvoiceStatus)
    ? (value as InvoiceStatus)
    : undefined;
}

export function mapProjectFromApi(dto: ApiProjectDTO): Project {
  const project = mapProjectFromDTO(dto, mapLeadFromDTO);
  return {
    ...project,
    client: mapClient(dto?.client),
    paymentSummary: mapPaymentSummary(dto?.paymentSummary),
  };
}

export function mapProjectsFromApi(dtos: ApiProjectDTO[]): Project[] {
  return mapProjectsFromDTO(dtos, mapLeadFromDTO).map((project, index) => ({
    ...project,
    client: mapClient(dtos[index]?.client),
    paymentSummary: mapPaymentSummary(dtos[index]?.paymentSummary),
  }));
}

export function mapFinancialsFromApi(rows: unknown): ProjectFinancialsEntry[] {
  if (!Array.isArray(rows)) return [];

  const entries: ProjectFinancialsEntry[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    // Some production responses serialize database ids as numeric strings.
    // Normalize them before the table joins financials with the project list.
    const id =
      typeof rec.id === "number"
        ? rec.id
        : typeof rec.id === "string" && rec.id.trim() !== ""
          ? Number(rec.id)
          : NaN;
    if (!Number.isInteger(id)) continue;

    // `qbo: null` significa que findAllFinancials cortó por timeout antes de
    // tocar esta fila. No es lo mismo que "no existe en QuickBooks" (eso llega
    // como `qbo: { data: null }`): se omite la fila para que la tabla conserve
    // los montos que ya tenía en vez de vaciarlos hasta el próximo refetch.
    if (rec.qbo === null || rec.qbo === undefined) continue;

    const qbo = rec.qbo as { error?: { code?: string; message?: string } } | null | undefined;
    const qboError =
      qbo?.error && typeof qbo.error.message === "string"
        ? { code: qbo.error.code ?? "qbo_query_failed", message: qbo.error.message }
        : undefined;

    // El backend anida paymentSummary e invoiceStatus dentro de `financial`;
    // aquí se suben al nivel de la entry porque en el Project viven fuera de él.
    const financial = (rec.financial as ProjectFinancial | null) ?? null;
    const extras = (financial ?? {}) as Record<string, unknown>;

    entries.push({
      id,
      financial,
      paymentSummary: mapPaymentSummary(extras.paymentSummary),
      invoiceStatus: resolveInvoiceStatus(extras.invoiceStatus),
      qboError,
    });
  }
  return entries;
}

export function mapProjectDraftToCreatePayload(
  draft: ProjectDraft
): CreateProjectPayload {
  return {
    projectProgressStatus: draft.projectProgressStatus,
    overview: draft.overview,
    leadId: draft.leadId,
    attachments: draft.attachments,
  };
}

export function mapProjectPatchToUpdatePayload(
  patch: ProjectPatch
): UpdateProjectPayload {
  return {
    projectProgressStatus: patch.projectProgressStatus,
    overview: patch.overview,
    leadId: patch.leadId,
    leadName: patch.leadName,
    leadNumber: patch.leadNumber,
    notes: patch.notes,
    attachments: patch.attachments,
  };
}
