"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useCompanyApp } from "@/di";
import { companyKeys } from "../../../application/keys";
import { companyCrudUseCases } from "../../../application/usecases/companyCrud";

type UseDeleteCompanyControllerOptions = {
  onDeleted?: () => void;
};

export function useDeleteCompanyController({ onDeleted }: UseDeleteCompanyControllerOptions) {
  const ctx = useCompanyApp();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCompany = useCallback(
    async (companyId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        await companyCrudUseCases.delete(ctx)(companyId);

        queryClient.invalidateQueries({ queryKey: companyKeys.all });
        queryClient.invalidateQueries({ queryKey: ["customers"] });

        onDeleted?.();
        return true;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [ctx, queryClient, onDeleted]
  );

  return {
    deleteCompany,
    isLoading,
    error,
    setError,
  };
}
