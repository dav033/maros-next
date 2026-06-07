import type {
  Contact,
  ContactDraft,
  ContactPatch,
} from "../../domain/models";


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
    notes: string[];
  } | null;
  notes?: string[] | null;
  attachments?: string[] | null;
};


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
      type: dto.company.type as any,
      serviceId: dto.company.serviceId ?? undefined,
      isCustomer: dto.company.isCustomer,
      isClient: dto.company.isClient,
      notes: dto.company.notes || [],
    } : undefined,
    notes: dto.notes ?? [],
    attachments: dto.attachments ?? [],
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
