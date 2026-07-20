import type { Lead, LeadStatus } from "../models";
import { coerceIsoLocalDate, normalizeText } from "@/shared/validation";

export type ApiProjectTypeDTO = {
  id?: number | string | null;
  name?: string | null;
  color?: string | null;
} | null;

export type ApiContactDTO = {
  id?: number | null;
  name?: string | null;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isCustomer?: boolean | null;
  isClient?: boolean | null;
} | null;

export type ApiLeadDTO = {
  id?: number | null;
  leadNumber?: string | null;
  name?: string | null;
  startDate?: string | null;
  location?: string | null;
  addressLink?: string | null;
  status?: string | null;
  leadType?: string | number | null;
  contact?: ApiContactDTO;
  projectType?: ApiProjectTypeDTO;
  project?: {
    id?: number | null;
  } | null;
  notes?: string[] | null;
  attachments?: string[] | null;
  conversion?: {
    converted?: boolean | null;
    projectId?: number | string | null;
  } | null;
  inReview?: boolean | null;
  /** Estimado manual, editable desde el CRM. Independiente de QuickBooks. */
  estimate?: number | string | null;
  /** Bloque QBO adjuntado por el backend (Estimate real, solo lectura). */
  financial?: {
    estimatedAmount?: number | null;
  } | null;
} | null;

function resolveStatus(status: string | null | undefined): LeadStatus {
  if (!status) {
    return "NEW_LEAD" as LeadStatus;
  }

  const upper = status.trim().toUpperCase();

  if (
    upper === "NEW_LEAD" ||
    upper === "CONTACTED" ||
    upper === "ESTIMATING_PREPARING_PROPOSAL" ||
    upper === "PROPOSAL_SENT" ||
    upper === "FOLLOW_UP" ||
    upper === "WON" ||
    upper === "LOST"
  ) {
    return upper as LeadStatus;
  }

  // Legacy value mappings
  if (upper === "NOT_EXECUTED" || upper === "NEW" || upper === "UNDETERMINED" || upper === "TO_DO") {
    return "NEW_LEAD" as LeadStatus;
  }

  if (upper === "IN_PROGRESS") {
    return "CONTACTED" as LeadStatus;
  }

  if (upper === "COMPLETED" || upper === "DONE") {
    return "WON" as LeadStatus;
  }

  if (upper === "POSTPONED" || upper === "PERMITS") {
    return "FOLLOW_UP" as LeadStatus;
  }

  return "NEW_LEAD" as LeadStatus;
}

// leadType ya no se lee del DTO, se calcula desde leadNumber

export function mapLeadFromDTO(dto: ApiLeadDTO): Lead {
  const id = dto?.id ?? 0;
  const leadNumber = normalizeText(dto?.leadNumber ?? "");
  const name = normalizeText(dto?.name ?? "");
  const location = normalizeText(dto?.location ?? "");
  const addressLink = normalizeText(dto?.addressLink ?? "");
  const startDate = dto?.startDate != null ? coerceIsoLocalDate(dto.startDate) : null;
  const status = resolveStatus(dto?.status ?? null);
  // leadType ya no se almacena en el modelo, se calcula desde leadNumber cuando se necesita

  const contactId =
    typeof dto?.contact?.id === "number"
      ? dto!.contact!.id
      : dto?.contact?.id
      ? Number(dto?.contact?.id)
      : 0;
  const contactName = normalizeText(dto?.contact?.name ?? "");
  const contactPhone = normalizeText(dto?.contact?.phone ?? "");
  const contactEmail = normalizeText(dto?.contact?.email ?? "");
  const contactOccupation = normalizeText(dto?.contact?.occupation ?? "");
  const contactAddress = normalizeText(dto?.contact?.address ?? "");
  const contactIsCustomer = !!dto?.contact?.isCustomer;
  const contactIsClient = !!dto?.contact?.isClient;

  const projectTypeId =
    typeof dto?.projectType?.id === "number"
      ? dto?.projectType?.id
      : dto?.projectType?.id
      ? Number(dto?.projectType?.id)
      : 0;

  const projectTypeName = normalizeText(dto?.projectType?.name ?? "");
  const projectTypeColor = normalizeText(dto?.projectType?.color ?? "");

  const notesArray = Array.isArray(dto?.notes) && dto.notes.length > 0 ? dto.notes.map(n => String(n)) : [];
  const attachmentsArray = Array.isArray(dto?.attachments) ? dto.attachments : [];
  const conversionProjectId =
    dto?.conversion?.projectId != null ? Number(dto.conversion.projectId) : undefined;
  const conversion = dto?.conversion
    ? {
        converted: Boolean(dto.conversion.converted),
        projectId: Number.isFinite(conversionProjectId)
          ? conversionProjectId
          : undefined,
      }
    : undefined;
  const inReview = dto?.inReview ?? false;
  // Estimado manual (editable en el CRM), independiente del Estimate real de QuickBooks.
  const estimate = dto?.estimate != null ? Number(dto.estimate) : null;
  const qboEstimate =
    dto?.financial?.estimatedAmount != null
      ? Number(dto.financial.estimatedAmount)
      : null;

  return {
    id,
    leadNumber,
    name,
    startDate,
    location,
    addressLink,
    status,
    inReview,
    estimate,
    qboEstimate,
    contact: {
      id: contactId,
      name: contactName,
      phone: contactPhone || undefined,
      email: contactEmail || undefined,
      occupation: contactOccupation || undefined,
      address: contactAddress || undefined,
      isCustomer: contactIsCustomer,
      isClient: contactIsClient,
      notes: [],
    },
    projectType: {
      id: projectTypeId,
      name: projectTypeName || "Unclassified",
      color: projectTypeColor || "#cccccc",
    },
    project:
      typeof dto?.project?.id === "number"
        ? { id: dto.project.id }
        : null,
    notes: notesArray,
    attachments: attachmentsArray,
    conversion,
  };
}

export function mapLeadsFromDTO(list: ApiLeadDTO[]): Lead[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapLeadFromDTO);
}
