import type {
  Contact,
  ContactDetails,
  ContactDraft,
  ContactPatch,
} from "../../domain/models";
import { CompanyType } from "@/features/company/domain/models/Company";
import { z } from "zod";


export type ApiContactDTO = {
  id: number;
  name: string;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  addressLink?: string | null;
  isCustomer: boolean;
  isClient: boolean;
  companyId?: number | null;
  company?: {
    id: number;
    name: string;
    address?: string | null;
    type?: string | null;
    serviceId?: number | null;
    isCustomer: boolean;
    isClient: boolean;
    notes?: unknown;
  } | null;
  notes?: unknown;
  attachments?: string[] | null;
};

const LegacyNotesSchema = z.union([
  z.array(z.string()),
  z.string(),
  z.record(z.string(), z.unknown()),
]).nullish();

const ContactLeadDetailsSchema = z.object({
  id: z.number(),
  leadNumber: z.string().nullish(),
  name: z.string().nullish(),
  startDate: z.string().nullish(),
  location: z.string().nullish(),
  addressLink: z.string().nullish(),
  status: z.string().nullish(),
  inReview: z.boolean(),
  projectType: z.object({ id: z.number(), name: z.string() }).nullish(),
  project: z.object({
    id: z.number(),
    projectProgressStatus: z.string().nullish(),
    overview: z.string().nullish(),
    notes: LegacyNotesSchema,
  }).nullish(),
  notes: LegacyNotesSchema,
}).passthrough();

const ContactDetailsApiSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  occupation: z.string().nullish(),
  role: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  address: z.string().nullish(),
  addressLink: z.string().nullish(),
  isCustomer: z.boolean(),
  isClient: z.boolean(),
  companyId: z.number().nullish(),
  company: z.object({
    id: z.number(),
    name: z.string(),
    address: z.string().nullish(),
    type: z.string().nullish(),
    serviceId: z.number().nullish(),
    isCustomer: z.boolean(),
    isClient: z.boolean(),
    notes: LegacyNotesSchema,
  }).nullish(),
  notes: LegacyNotesSchema,
  attachments: z.array(z.string()).nullish(),
  leads: z.array(ContactLeadDetailsSchema),
  stats: z.object({
    totalLeads: z.number(),
    totalProjects: z.number(),
    activeProjects: z.number(),
    completedProjects: z.number(),
  }),
}).passthrough();

function normalizeNotes(value: unknown, field: string): string[] {
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) return value.filter((note): note is string => typeof note === "string");
  if (value && typeof value === "object") {
    console.warn("Ignoring structured legacy data in a notes field", { field, keys: Object.keys(value) });
  }
  return [];
}

function isCompanyType(value: string): value is CompanyType {
  return Object.values(CompanyType).some((companyType) => companyType === value);
}

function mapCompanyType(value: string | null | undefined): CompanyType {
  return value && isCompanyType(value) ? value : CompanyType.OTHER;
}


export type CreateContactRequestDTO = {
  name: string;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  addressLink?: string | null;
  isCustomer: boolean;
  isClient: boolean;
  companyId?: number | null;
  notes?: string[] | null;
  attachments?: string[] | null;
};


export type UpdateContactRequestDTO = {
  name?: string;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  addressLink?: string | null;
  isCustomer?: boolean;
  isClient?: boolean;
  companyId?: number | null;
  notes?: string[] | null;
  attachments?: string[] | null;
};


export function mapContactFromApi(dto: ApiContactDTO): Contact {
  const normalizedName = typeof dto.name === "string" ? dto.name : "";
  const normalizedCompanyName =
    dto.company && typeof dto.company.name === "string" ? dto.company.name : "";

  return {
    id: dto.id,
    name: normalizedName,
    role: dto.occupation ?? undefined,
    occupation: dto.occupation ?? undefined,
    phone: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    address: dto.address ?? undefined,
    addressLink: dto.addressLink ?? undefined,
    isCustomer: dto.isCustomer,
    isClient: dto.isClient,
    companyId: dto.company?.id ?? dto.companyId ?? undefined,
    company: dto.company ? {
      id: dto.company.id,
      name: normalizedCompanyName,
      address: dto.company.address ?? undefined,
      type: mapCompanyType(dto.company.type),
      serviceId: dto.company.serviceId ?? undefined,
      isCustomer: dto.company.isCustomer,
      isClient: dto.company.isClient,
      notes: normalizeNotes(dto.company.notes, "company.notes"),
    } : undefined,
    notes: normalizeNotes(dto.notes, "contact.notes"),
    attachments: dto.attachments ?? [],
  };
}

export function mapContactDetailsFromApi(dto: unknown): ContactDetails {
  const parsed = ContactDetailsApiSchema.parse(dto);
  const contact = mapContactFromApi(parsed);
  return {
    ...contact,
    id: parsed.id,
    notes: normalizeNotes(parsed.notes, "contact.notes"),
    leads: parsed.leads.map((lead) => ({
      id: lead.id,
      leadNumber: lead.leadNumber ?? undefined,
      name: lead.name ?? undefined,
      startDate: lead.startDate ?? undefined,
      location: lead.location ?? undefined,
      addressLink: lead.addressLink ?? undefined,
      status: lead.status ?? undefined,
      inReview: lead.inReview,
      projectType: lead.projectType ?? null,
      notes: normalizeNotes(lead.notes, "lead.notes"),
      project: lead.project ? {
        id: lead.project.id,
        projectProgressStatus: lead.project.projectProgressStatus ?? undefined,
        overview: lead.project.overview ?? undefined,
        notes: normalizeNotes(lead.project.notes, "project.notes"),
      } : null,
    })),
    stats: parsed.stats,
  };
}


export function mapContactsFromApi(dtos: ApiContactDTO[]): Contact[] {
  return dtos.map(mapContactFromApi);
}


export function mapContactDraftToCreateDTO(
  draft: ContactDraft,
): CreateContactRequestDTO {
  return {
    name: draft.name,
    occupation: draft.role ?? draft.occupation ?? null,
    phone: draft.phone ?? null,
    email: draft.email ?? null,
    address: draft.address ?? null,
    addressLink: draft.addressLink ?? null,
    isCustomer: draft.isCustomer ?? false,
    isClient: draft.isClient ?? false,
    companyId: draft.companyId ?? null,
    notes:
      draft.notes && draft.notes.length > 0
        ? draft.notes
        : null,
    attachments: draft.attachments ?? null,
  };
}


export function mapContactPatchToUpdateDTO(
  patch: ContactPatch,
): UpdateContactRequestDTO {
  const dto: UpdateContactRequestDTO = {};
  
  if (patch.name !== undefined) dto.name = patch.name;
  
 
 
  if (patch.role !== undefined) {
    dto.occupation = patch.role;
  } else if (patch.occupation !== undefined) {
    dto.occupation = patch.occupation;
  }

  if (patch.phone !== undefined) dto.phone = patch.phone;
  if (patch.email !== undefined) dto.email = patch.email;
  if (patch.address !== undefined) dto.address = patch.address;
  if (patch.addressLink !== undefined) dto.addressLink = patch.addressLink;
  if (patch.isCustomer !== undefined) dto.isCustomer = patch.isCustomer;
  if (patch.isClient !== undefined) dto.isClient = patch.isClient;
  if (patch.companyId !== undefined) dto.companyId = patch.companyId;
  if (patch.notes !== undefined) dto.notes = patch.notes;
  if (patch.attachments !== undefined) dto.attachments = patch.attachments;

  return dto;
}
