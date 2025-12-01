import type { Lead, LeadStatus, LeadType } from "../models";
import { coerceIsoLocalDate, normalizeText } from "@/shared";

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
} | null;

export type ApiLeadDTO = {
  id?: number | null;
  leadNumber?: string | null;
  name?: string | null;
  startDate?: string | null;
  location?: string | null;
  status?: string | null;
  leadType?: string | number | null;
  contact?: ApiContactDTO;
  projectType?: ApiProjectTypeDTO;
  notes?: string[] | null;
} | null;


function resolveStatus(status: string | null | undefined): LeadStatus {
  if (!status) {
    return "NOT_EXECUTED" as LeadStatus;
  }

  const upper = status.trim().toUpperCase();

  if (
    upper === "NOT_EXECUTED" ||
    upper === "COMPLETED" ||
    upper === "IN_PROGRESS" ||
    upper === "LOST" ||
    upper === "POSTPONED" ||
    upper === "PERMITS"
  ) {
    return upper as LeadStatus;
  }


  if (upper === "NEW" || upper === "UNDETERMINED" || upper === "TO_DO") {
    return "NOT_EXECUTED" as LeadStatus;
  }

  if (upper === "DONE") {
    return "COMPLETED" as LeadStatus;
  }

  return "NOT_EXECUTED" as LeadStatus;
}

function resolveLeadType(input: unknown): LeadType {
  if (typeof input === "string") {
    const v = input.trim().toUpperCase();
    if (v === "CONSTRUCTION" || v === "PLUMBING" || v === "ROOFING") {
      return v as LeadType;
    }
  }
  if (typeof input === "number") {
    switch (input) {
      case 1:
        return "CONSTRUCTION" as LeadType;
      case 2:
        return "PLUMBING" as LeadType;
      case 3:
        return "ROOFING" as LeadType;
      default:
        return "CONSTRUCTION" as LeadType;
    }
  }
  return "CONSTRUCTION" as LeadType;
}

export function mapLeadFromDTO(dto: ApiLeadDTO): Lead {
  const id = dto?.id ?? 0;
  const leadNumber = normalizeText(dto?.leadNumber ?? "");
  const name = normalizeText(dto?.name ?? "");
  const location = normalizeText(dto?.location ?? "");
  const startDate = coerceIsoLocalDate(dto?.startDate ?? "");
  const status = resolveStatus(dto?.status ?? null);
  const leadType = resolveLeadType(dto?.leadType ?? null);

  const contactId = dto?.contact?.id ?? 0;
  const contactName = normalizeText(dto?.contact?.name ?? "");
  const contactPhone = normalizeText(dto?.contact?.phone ?? "");
  const contactEmail = normalizeText(dto?.contact?.email ?? "");
  const contactOccupation = normalizeText(dto?.contact?.occupation ?? "");
  const contactAddress = normalizeText(dto?.contact?.address ?? "");
  const contactIsCustomer = !!dto?.contact?.isCustomer;

  const projectTypeId =
    typeof dto?.projectType?.id === "number"
      ? dto?.projectType?.id
      : dto?.projectType?.id
      ? Number(dto?.projectType?.id)
      : 0;

  const projectTypeName = normalizeText(dto?.projectType?.name ?? "");
  const projectTypeColor = normalizeText(dto?.projectType?.color ?? "");

  const notesArray = Array.isArray(dto?.notes) && dto.notes.length > 0 ? dto.notes.map(n => String(n)) : [];
  return {
    id,
    leadNumber,
    name,
    startDate,
    location,
    status,
    leadType,
    contact: {
      id: contactId,
      name: contactName,
      phone: contactPhone || undefined,
      email: contactEmail || undefined,
      occupation: contactOccupation || undefined,
      address: contactAddress || undefined,
      isCustomer: contactIsCustomer,
      isClient: false,
      notes: [],
    },
    projectType: {
      id: projectTypeId,
      name: projectTypeName || "Unclassified",
      color: projectTypeColor || "#cccccc",
    },
    notesJson: notesArray.length ? JSON.stringify(notesArray) : "[]",
  };
}

export function mapLeadsFromDTO(list: ApiLeadDTO[]): Lead[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapLeadFromDTO);
}
