"use client";

import { useCompanyApp } from "@/di";
import { useInstantList } from "@/shared/query";

import { companyKeys } from "../../../application/keys/companyKeys";
import { companyCrudUseCases } from "../../../application/usecases/companyCrud";
import type { Company } from "../../../domain/models";

export type UseInstantCompaniesResult = {
  companies: Company[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

export function useInstantCompanies(initialData?: Company[]): UseInstantCompaniesResult {
  const ctx = useCompanyApp();
  const r = useInstantList<Company>({
    queryKey: companyKeys.lists(),
    queryFn: () => companyCrudUseCases.list(ctx)(),
    initialData,
  });
  return { ...r, companies: r.data };
}
