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
};


export type CreateContactRequestDTO = {
  name: string;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isCustomer: boolean;
  isClient: boolean;
  companyId?: number | null;
  notes?: string[] | null;
};


export type UpdateContactRequestDTO = {
  name: string;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isCustomer: boolean;
  isClient: boolean;
  companyId?: number | null;
  notes?: string[] | null;
};


export function mapContactFromApi(dto: ApiContactDTO): Contact {
  return {
    id: dto.id,
    name: dto.name,
    occupation: dto.occupation ?? undefined,
    phone: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    address: dto.address ?? undefined,
    isCustomer: dto.isCustomer,
    isClient: dto.isClient,
    companyId: dto.company?.id ?? dto.companyId ?? undefined,
    company: dto.company ? {
      id: dto.company.id,
      name: dto.company.name,
      address: dto.company.address ?? undefined,
      type: dto.company.type as any,
      serviceId: dto.company.serviceId ?? undefined,
      isCustomer: dto.company.isCustomer,
      isClient: dto.company.isClient,
      notes: dto.company.notes || [],
    } : undefined,
    notes: dto.notes ?? [],
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
    occupation: draft.occupation ?? null,
    phone: draft.phone ?? null,
    email: draft.email ?? null,
    address: draft.address ?? null,
    isCustomer: draft.isCustomer ?? false,
    isClient: draft.isClient ?? false,
    companyId: draft.companyId ?? null,
    notes:
      draft.notes && draft.notes.length > 0
        ? draft.notes
        : null,
  };
}


export function mapContactPatchToUpdateDTO(
  patch: ContactPatch,
): UpdateContactRequestDTO {
  return {
    name: patch.name ?? "",
    occupation: patch.occupation ?? null,
    phone: patch.phone ?? null,
    email: patch.email ?? null,
    address: patch.address ?? null,
    isCustomer: patch.isCustomer ?? false,
    isClient: patch.isClient ?? false,
    companyId: patch.companyId ?? null,
    notes: patch.notes ?? null,
  };
}
