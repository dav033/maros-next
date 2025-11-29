import type { Contact } from "../models";
import { BusinessRuleError, normalizeText } from "@/shared";
import { ensureContactIntegrity } from "./ensureContactIntegrity";

export type ApiContactDTO = Readonly<{
  id?: number | null;
  name?: string | null;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isCustomer?: boolean | null;
  isClient?: boolean | null;
  companyId?: number | null;
}>;

export function mapContactFromDTO(dto: ApiContactDTO): Contact {
  const id = dto.id;
  if (!Number.isFinite(id) || id == null || id <= 0) {
    throw new BusinessRuleError(
      "VALIDATION_ERROR",
      "Contact id must be a valid positive number",
      { details: { field: "id", value: id } }
    );
  }

  const name = normalizeText(dto.name);
  const occupation = normalizeText(dto.occupation) || undefined;
  const phone = normalizeText(dto.phone) || undefined;
  const email = normalizeText(dto.email) || undefined;
  const address = normalizeText(dto.address) || undefined;
  const isCustomer = !!dto.isCustomer;
  const isClient = !!dto.isClient;
  const companyId = dto.companyId != null && dto.companyId > 0 ? dto.companyId : null;

  const contact: Contact = {
    id,
    name,
    occupation,
    phone,
    email,
    address,
    isCustomer,
    isClient,
    companyId: companyId ?? undefined,
  };

  ensureContactIntegrity(contact);

  return contact;
}

export function mapContactsFromDTO(
  list?: readonly ApiContactDTO[] | null
): Contact[] {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(mapContactFromDTO);
}
