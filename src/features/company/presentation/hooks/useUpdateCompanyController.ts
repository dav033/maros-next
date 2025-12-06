"use client";

import { useCompanyApp } from "@/di";
import { companyKeys } from "../../application/keys";
import { companyCrudUseCases } from "../../application/usecases/companyCrud";
import type { Company, CompanyPatch, CompanyType } from "../../domain/models";
import { useFormController } from "@/shared/ui";

type CompanyFormData = {
  name: string;
  address?: string;
  addressLink?: string;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
};

type UseUpdateCompanyControllerOptions = {
  companyId: number;
  initialData: Company;
  onUpdated?: (company: Company) => void;
};

export function useUpdateCompanyController({
  companyId,
  initialData,
  onUpdated,
}: UseUpdateCompanyControllerOptions) {
  const ctx = useCompanyApp();

  return useFormController<CompanyFormData, Company>({
    initialForm: {
      name: initialData.name,
      address: initialData.address ?? "",
      addressLink: initialData.addressLink ?? "",
      type: initialData.type,
      serviceId: initialData.serviceId ?? null,
      isCustomer: initialData.isCustomer,
    },
    validate: (form) => form.name.trim().length > 0,
    transformBeforeSubmit: (form) => {
      const patch: CompanyPatch = {
        name: form.name.trim() !== initialData.name ? form.name.trim() : undefined,
        address: form.address?.trim() !== initialData.address ? form.address?.trim() : undefined,
        addressLink: form.addressLink?.trim() !== initialData.addressLink ? form.addressLink?.trim() : undefined,
        type: form.type !== initialData.type ? form.type : undefined,
        serviceId: form.serviceId !== initialData.serviceId ? form.serviceId : undefined,
        isCustomer: form.isCustomer !== initialData.isCustomer ? form.isCustomer : undefined,
      };
      
      const hasChanges = Object.values(patch).some(v => v !== undefined);
      return hasChanges ? (patch as any) : null;
    },
    onSubmit: async (patch) => {
      return await companyCrudUseCases.update(ctx)(companyId, patch as CompanyPatch);
    },
    invalidateKeys: [companyKeys.all],
    onSuccess: onUpdated,
  });
}
