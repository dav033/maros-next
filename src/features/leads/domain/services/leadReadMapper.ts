import type { Lead, LeadLostReason, LeadSource, LeadStatus } from "../models";
import { LEAD_LOST_REASONS, LEAD_SOURCES } from "../models";
import { coerceIsoLocalDate, isIsoLocalDate, normalizeText } from "@/shared/validation";

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
  ownerId?: number | null;
  source?: string | null;
  lostReason?: string | null;
  nextFollowUpAt?: string | null;
  statusChangedAt?: string | null;
} | null;

/**
 * Un valor fuera del catálogo del backend no se pinta: el select sólo ofrece los
 * ocho válidos, así que mostrarlo crudo sólo confundiría.
 */
function resolveEnum<T extends string>(
  allowed: readonly T[],
  value: unknown
): T | null {
  const raw = normalizeText(value ?? "");
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

function resolveLocalDate(value: unknown): string | null {
  const raw = normalizeText(value ?? "");
  if (!raw) return null;
  const date = raw.slice(0, 10);
  return isIsoLocalDate(date) ? date : null;
}

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
  const ownerId =
    typeof dto?.ownerId === "number" && Number.isFinite(dto.ownerId)
      ? dto.ownerId
      : null;
  const source = resolveEnum<LeadSource>(LEAD_SOURCES, dto?.source);
  const lostReason = resolveEnum<LeadLostReason>(LEAD_LOST_REASONS, dto?.lostReason);
  const nextFollowUpAt = resolveLocalDate(dto?.nextFollowUpAt);
  const statusChangedAt = normalizeText(dto?.statusChangedAt ?? "") || null;

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
    ownerId,
    source,
    lostReason,
    nextFollowUpAt,
    statusChangedAt,
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
      // Sin color del backend se deja vacío: el color por defecto lo decide la
      // presentación (ProjectTypeBadge), no un hex crudo en el dominio.
      color: projectTypeColor,
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
