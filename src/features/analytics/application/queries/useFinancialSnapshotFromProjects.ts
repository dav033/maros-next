"use client";

import { useMemo } from "react";
import { useInstantProjects } from "@/project";
import { getLeadTypeFromNumber, type LeadType } from "@/leads/domain";
import type { FinancialSnapshot } from "../../domain/financial-snapshot";

type QueryLike<T> = {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  refetch: () => Promise<unknown>;
};

export function useFinancialSnapshotFromProjects(leadType?: LeadType): QueryLike<FinancialSnapshot> {
  const { projects, isLoading, error, refetch } = useInstantProjects();

  const data = useMemo<FinancialSnapshot | undefined>(() => {
    if (!projects) return undefined;
    let projectCount = 0;
    let estimatedTotal = 0;
    let invoicedTotal = 0;
    let paidTotal = 0;
    let outstandingTotal = 0;
    for (const project of projects) {
      if (leadType) {
        const projectLeadType = getLeadTypeFromNumber(project.lead?.leadNumber);
        if (projectLeadType !== leadType) continue;
      }
      const f = project.financial;
      if (!f) continue;
      projectCount += 1;
      estimatedTotal += f.estimatedAmount;
      invoicedTotal += f.invoicedAmount;
      paidTotal += f.paidAmount;
      outstandingTotal += f.outstandingAmount;
    }
    return { projectCount, estimatedTotal, invoicedTotal, paidTotal, outstandingTotal };
  }, [projects, leadType]);

  return { isLoading, error, data, refetch };
}
