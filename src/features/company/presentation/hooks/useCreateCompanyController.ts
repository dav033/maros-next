"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useCompanyApp } from "@/di";
import { companyKeys } from "../../application/keys";
import { companyCrudUseCases } from "../../application/usecases/companyCrud";
import type { Company, CompanyDraft, CompanyType } from "../../domain/models";

type CompanyFormData = {
  name: string;
  address?: string;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
};

type UseCreateCompanyControllerOptions = {
  onCreated?: (company: Company) => void;
};

export function useCreateCompanyController({ onCreated }: UseCreateCompanyControllerOptions) {
  const ctx = useCompanyApp();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CompanyFormData>({
    name: "",
    address: "",
    type: "DESIGN" as CompanyType,
    serviceId: null,
    isCustomer: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return form.name.trim().length > 0;
  }, [form.name]);

  const setField = useCallback(<K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit || isLoading) return false;
    setIsLoading(true);
    setError(null);

    try {
      const draft: CompanyDraft = {
        name: form.name.trim(),
        address: form.address?.trim(),
        type: form.type,
        serviceId: form.serviceId ?? null,
        isCustomer: form.isCustomer,
      };

      const created = await companyCrudUseCases.create(ctx)(draft);

      queryClient.invalidateQueries({ queryKey: companyKeys.all });

      onCreated?.(created);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, isLoading, form, ctx, queryClient, onCreated]);

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
