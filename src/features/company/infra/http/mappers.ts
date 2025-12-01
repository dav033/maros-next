import {
  Company,
  CompanyDraft,
  CompanyPatch,
  CompanyType,
} from "../../domain/models";




export type ApiCompanyDTO = {
  id: number;
  name: string;
  address?: string | null;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  notes?: string[] | null;
};


export type CreateCompanyRequestDTO = {
  name: string;
  address?: string | null;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  notes?: string[] | null;
};


export type UpdateCompanyRequestDTO = {
  name: string;
  address?: string | null;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  notes?: string[] | null;
};


export function mapCompanyFromApi(dto: ApiCompanyDTO): Company {
  let type = dto.type;
  if (!Object.values(CompanyType).includes(type as CompanyType)) {
    console.warn(`Unknown company type "${dto.type}" for company ${dto.id}, defaulting to OTHER`);
    type = CompanyType.OTHER;
  }
  
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address ?? undefined,
    type: type as CompanyType,
    serviceId: dto.serviceId ?? undefined,
    isCustomer: dto.isCustomer,
    isClient: dto.isClient,
    notes: dto.notes ?? [],
  };
}


export function mapCompaniesFromApi(dtos: ApiCompanyDTO[]): Company[] {
  return dtos.map(mapCompanyFromApi);
}


export function mapCompanyDraftToCreateDTO(
  draft: CompanyDraft,
): CreateCompanyRequestDTO {
  return {
    name: draft.name,
    address: draft.address ?? null,
    type: draft.type,
    serviceId: draft.serviceId ?? null,
    isCustomer: draft.isCustomer ?? false,
    isClient: draft.isClient ?? false,
    notes:
      draft.notes && draft.notes.length > 0
        ? draft.notes
        : null,
  };
}


export function mapCompanyPatchToUpdateDTO(
  patch: CompanyPatch,
): UpdateCompanyRequestDTO {
  const dto: any = {};
  
  if (patch.name !== undefined && patch.name !== null) {
    dto.name = patch.name;
  }
  if (patch.address !== undefined) {
    dto.address = patch.address;
  }
  if (patch.type !== undefined) {
    dto.type = patch.type;
  }
  if (patch.serviceId !== undefined) {
    dto.serviceId = patch.serviceId;
  }
  if (patch.isCustomer !== undefined) {
    dto.isCustomer = patch.isCustomer;
  }
  if (patch.isClient !== undefined) {
    dto.isClient = patch.isClient;
  }
  if (patch.notes !== undefined) {
    dto.notes = patch.notes;
  }
  
  return dto;
}




export type ApiCompanyServiceDTO = any;


export function mapCompanyServiceFromApi(dto: ApiCompanyServiceDTO) {
  return dto as any;
}


export function mapCompanyServicesFromApi(dtos: ApiCompanyServiceDTO[]) {
  return dtos.map(mapCompanyServiceFromApi);
}


export function mapCompanyServiceDraftToCreateDTO(draft: any) {
  return draft as any;
}


export function mapCompanyServicePatchToUpdateDTO(patch: any) {
  return patch as any;
}
