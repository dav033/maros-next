"use client";

import { useQuery } from "@tanstack/react-query";
import { useLeadsApp } from "@/di";
import { getLeadByNumber } from "@/leads/application";
import type { Lead } from "@/leads/domain";

export function useLeadByNumber(leadNumber: string | null) {
  const ctx = useLeadsApp();

  return useQuery<Lead, Error>({
    queryKey: ["lead", "byNumber", leadNumber],
    queryFn: async () => {
      if (!leadNumber) {
        throw new Error("Lead number is required");
      }
      return getLeadByNumber(ctx, leadNumber);
    },
    enabled: !!leadNumber && leadNumber.trim() !== "",
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}






