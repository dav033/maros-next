import type {
  Contact,
  ContactDraft,
  ContactPatch,
} from "../../domain/models";

/**
 * DTO que llega desde la API para Contact
 * (alineado con io.dav033.maroconstruction.dto.Contacts)
 */
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
  // Notas como arreglo (vía getNotes()/setNotes() en el backend)
  notes?: string[] | null;
};

/**
 * DTO para crear Contact (POST /contacts)
 */
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

/**
 * DTO para actualizar Contact (PUT/PATCH /contacts/{id})
 */
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

/**
 * Mapper: de lo que viene de la API → modelo interno Contact
 */
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
    companyId: dto.companyId ?? undefined,
    // Si la API no envía notas, devolvemos arreglo vacío para evitar errores
    notes: dto.notes ?? [],
  };
}

/**
 * Mapper: lista de DTOs → lista de Contact
 * (para fromApiList en el HttpRepository)
 */
export function mapContactsFromApi(dtos: ApiContactDTO[]): Contact[] {
  return dtos.map(mapContactFromApi);
}

/**
 * Mapper: borrador de Contact → DTO para crear
 */
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
    // Solo enviamos notas si hay algo
    notes:
      draft.notes && draft.notes.length > 0
        ? draft.notes
        : null,
  };
}

/**
 * Mapper: cambios de Contact → DTO para actualizar
 */
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
    // Si viene undefined, lo convertimos en null (no romper el contrato)
    notes: patch.notes ?? null,
  };
}
