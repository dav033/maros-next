import { normalizeEmptyToUndefined, pickDefined } from "@/shared";

export interface CreateContactRequestDTO {
  name: string;
  companyName?: string;
  occupation?: string;
  product?: string;
  phone?: string;
  email?: string;
  address?: string;
  lastContact?: string;
}

export type UpdateContactRequestDTO = Partial<CreateContactRequestDTO>;

type LooseCreateContactRequestDTO = {
  [K in keyof CreateContactRequestDTO]?: string | undefined;
};

type LooseUpdateContactRequestDTO = {
  [K in keyof CreateContactRequestDTO]?: string | undefined;
};

export function buildCreateContactDTO(
  draft: CreateContactRequestDTO
): CreateContactRequestDTO {
  const loose: LooseCreateContactRequestDTO = {
    name: draft.name,
    companyName: normalizeEmptyToUndefined(draft.companyName),
    occupation: normalizeEmptyToUndefined(draft.occupation),
    product: normalizeEmptyToUndefined(draft.product),
    phone: normalizeEmptyToUndefined(draft.phone),
    email: normalizeEmptyToUndefined(draft.email),
    address: normalizeEmptyToUndefined(draft.address),
    lastContact: normalizeEmptyToUndefined(draft.lastContact),
  };

  return pickDefined(loose) as CreateContactRequestDTO;
}

export function buildUpdateContactDTO(
  patch: UpdateContactRequestDTO
): UpdateContactRequestDTO {
  const loose: LooseUpdateContactRequestDTO = {
    name: normalizeEmptyToUndefined(patch.name),
    companyName: normalizeEmptyToUndefined(patch.companyName),
    occupation: normalizeEmptyToUndefined(patch.occupation),
    product: normalizeEmptyToUndefined(patch.product),
    phone: normalizeEmptyToUndefined(patch.phone),
    email: normalizeEmptyToUndefined(patch.email),
    address: normalizeEmptyToUndefined(patch.address),
    lastContact: normalizeEmptyToUndefined(patch.lastContact),
  };

  return pickDefined(loose) as UpdateContactRequestDTO;
}
