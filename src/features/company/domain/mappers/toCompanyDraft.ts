import type { CompanyDraft, CompanyType } from "../models";
import type { CompanyFormValue } from "../../presentation/molecules/CompanyForm";
import { normalizeEmptyToUndefined } from "@/shared/mappers/dto";
import { CompanyType as CompanyTypeEnum } from "../models";

export function toCompanyDraft(value: CompanyFormValue): CompanyDraft {
  return {
    name: value.name.trim(),
    address: normalizeEmptyToUndefined(value.address),
    addressLink: normalizeEmptyToUndefined(value.addressLink),
    type: value.type ?? CompanyTypeEnum.OTHER,
    serviceId: value.serviceId,
    isCustomer: value.isCustomer,
    isClient: value.isClient,
    phone: normalizeEmptyToUndefined(value.phone),
    email: normalizeEmptyToUndefined(value.email),
    submiz: normalizeEmptyToUndefined(value.submiz),
  };
}
