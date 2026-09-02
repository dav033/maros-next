"use client";

import { useMemo } from "react";
import { useInstantProjects } from "./useInstantProjects";
import { useProjectsFinancials } from "./useProjectsFinancials";
import type { Project } from "@/project/domain";
import { LeadType } from "@/leads/domain";
import { getLeadTypeFromNumber } from "@/features/leads/domain/utils/lead-type.utils";

export type UseProjectsDataReturn = {
  projects: Project[];
  showSkeleton: boolean;
  /** True while QuickBooks financial data is still loading in the background (projects are already rendered). */
  financialsLoading: boolean;
  refetch: () => Promise<void>;
};

import type { ProjectsPageData } from "../../data/loadProjectsData";

export function useProjectsData({
  initialData,
  leadType,
}: {
  initialData?: ProjectsPageData;
  leadType: LeadType;
}): UseProjectsDataReturn {
  const { projects, showSkeleton, refetch } = useInstantProjects(initialData?.projects);
  const { financialsById, isLoading: financialsLoading } = useProjectsFinancials({
    enabled: !showSkeleton,
  });

  const projectsByType = useMemo(
    () =>
      (projects ?? [])
        .filter((project) => getLeadTypeFromNumber(project.lead?.leadNumber) === leadType)
        .map((project) => {
          const entry = financialsById.get(project.id);
          if (!entry) return project;
          return { ...project, financial: entry.financial ?? undefined, qboError: entry.qboError };
        }),
    [projects, leadType, financialsById],
  );

  return {
    projects: projectsByType,
    showSkeleton,
    financialsLoading,
    refetch,
  };
}
