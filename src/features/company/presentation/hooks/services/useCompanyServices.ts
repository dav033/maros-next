"use client";

import { useCompanyApp } from "@/di";
import { useInstantList } from "@/shared/query";

import { companyServiceCrudUseCases } from "../../../application/usecases/companyServiceCrud";
import type { CompanyService } from "../../../domain/models";

export type UseCompanyServicesResult = {
  services: CompanyService[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

export function useCompanyServices(
  initialData?: CompanyService[],
): UseCompanyServicesResult {
  const app = useCompanyApp();
  const r = useInstantList<CompanyService>({
    queryKey: ["companyServices"],
    queryFn: () => companyServiceCrudUseCases.list(app)(),
    initialData,
  });
  return { ...r, services: r.data };
}
