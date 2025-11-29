"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useCompanyApp } from "@/di";
import { companyKeys } from "../../application/keys";
import { companyCrudUseCases } from "../../application/usecases/companyCrud";
import type { Company, CompanyPatch, CompanyType } from "../../domain/models";

type CompanyFormData = {
  name: string;
  address?: string;
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
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CompanyFormData>({
    name: initialData.name,
    address: initialData.address ?? "",
    type: initialData.type,
    serviceId: initialData.serviceId ?? null,
    isCustomer: initialData.isCustomer,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return form.name.trim().length > 0;
  }, [form.name]);

  const setField = useCallback(
    <K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) => {
      setError(null);
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const submit = useCallback(async () => {
    if (!canSubmit || isLoading) return false;
    setIsLoading(true);
    setError(null);

    try {
      const patch: CompanyPatch = {
        name: form.name.trim() !== initialData.name ? form.name.trim() : undefined,
        address: form.address?.trim() !== initialData.address ? form.address?.trim() : undefined,
        type: form.type !== initialData.type ? form.type : undefined,
        serviceId: form.serviceId !== initialData.serviceId ? form.serviceId : undefined,
        isCustomer: form.isCustomer !== initialData.isCustomer ? form.isCustomer : undefined,
      };

      const updated = await companyCrudUseCases.update(ctx)(companyId, patch);

      queryClient.invalidateQueries({ queryKey: companyKeys.all });

      onUpdated?.(updated);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, isLoading, form, initialData, companyId, ctx, queryClient, onUpdated]);

  return {
    form,
    setField,
    isLoading,
    error,
    setError,
    canSubmit,
    submit,
  };
}
