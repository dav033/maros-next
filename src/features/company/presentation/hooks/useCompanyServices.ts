import { useQuery } from "@tanstack/react-query";
import { useCompanyApp } from "@/di";
import { companyServiceCrudUseCases } from "../../application/usecases/companyServiceCrud";

export function useCompanyServices() {
  const app = useCompanyApp();

  const { data: services, isLoading } = useQuery({
    queryKey: ["companyServices"],
    queryFn: () => companyServiceCrudUseCases.list(app)(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    services: services ?? [],
    isLoading,
  };
}
