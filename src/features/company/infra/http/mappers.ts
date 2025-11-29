import {
  Company,
  CompanyDraft,
  CompanyPatch,
  CompanyType,
} from "../../domain/models";

/* =========================================================
 * MAPPERS DE COMPANY
 * ========================================================= */

/**
 * DTO que llega desde la API para Company
 */
export type ApiCompanyDTO = {
  id: number;
  name: string;
  address?: string | null;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  // Notas como arreglo (igual que en Leads)
  notes?: string[] | null;
};

/**
 * DTO para crear Company (lo que se envía al backend en un POST)
 */
export type CreateCompanyRequestDTO = {
  name: string;
  address?: string | null;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  // Notas como arreglo
  notes?: string[] | null;
};

/**
 * DTO para actualizar Company (lo que se envía al backend en un PUT/PATCH)
 */
export type UpdateCompanyRequestDTO = {
  name: string;
  address?: string | null;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  // Notas como arreglo
  notes?: string[] | null;
};

/**
 * Mapper: de lo que viene de la API → modelo interno Company
 */
export function mapCompanyFromApi(dto: ApiCompanyDTO): Company {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address ?? undefined,
    type: dto.type,
    serviceId: dto.serviceId ?? undefined,
    isCustomer: dto.isCustomer,
    isClient: dto.isClient,
    // Si la API no envía notas, devolvemos arreglo vacío para evitar errores en UI
    notes: dto.notes ?? [],
  };
}

/**
 * Mapper: lista de DTOs → lista de Company
 */
export function mapCompaniesFromApi(dtos: ApiCompanyDTO[]): Company[] {
  return dtos.map(mapCompanyFromApi);
}

/**
 * Mapper: de borrador de Company (formulario) → DTO para crear
 */
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
    // Solo enviamos notas si hay algo
    notes:
      draft.notes && draft.notes.length > 0
        ? draft.notes
        : null,
  };
}

/**
 * Mapper: de cambios de Company (patch) → DTO para actualizar
 */
export function mapCompanyPatchToUpdateDTO(
  patch: CompanyPatch,
): UpdateCompanyRequestDTO {
  return {
    name: patch.name ?? "",
    address: patch.address ?? null,
    type: patch.type ?? CompanyType.OTHER,
    serviceId: patch.serviceId ?? null,
    isCustomer: patch.isCustomer ?? false,
    isClient: patch.isClient ?? false,
    // Mandamos lo que venga en patch.notes (incluido null)
    notes: patch.notes ?? null,
  };
}

/* =========================================================
 * MAPPERS DE COMPANY SERVICE
 * (para resolver los imports que rompen el build)
 * ========================================================= */

/**
 * DTO de CompanyService que se usa en el repositorio HTTP.
 * Lo dejamos flexible a propósito.
 */
export type ApiCompanyServiceDTO = any;

/**
 * Mapper: de DTO de API → modelo interno de CompanyService.
 * Aquí dejamos un mapeo directo (lo que llega, se pasa tal cual).
 */
export function mapCompanyServiceFromApi(dto: ApiCompanyServiceDTO) {
  return dto as any;
}

/**
 * Mapper: lista de DTOs de API → lista de CompanyService.
 */
export function mapCompanyServicesFromApi(dtos: ApiCompanyServiceDTO[]) {
  return dtos.map(mapCompanyServiceFromApi);
}

/**
 * Mapper: de borrador de CompanyService → DTO para crear.
 */
export function mapCompanyServiceDraftToCreateDTO(draft: any) {
  return draft as any;
}

/**
 * Mapper: de cambios de CompanyService → DTO para actualizar.
 */
export function mapCompanyServicePatchToUpdateDTO(patch: any) {
  return patch as any;
}
