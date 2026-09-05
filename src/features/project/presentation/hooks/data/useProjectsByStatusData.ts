"use client";

import { useMemo } from "react";
import { useInstantProjects } from "./useInstantProjects";
import { mergeProjectFinancials, useProjectsFinancials } from "./useProjectsFinancials";
import type { Project, ProjectProgressStatus } from "@/project/domain";

export type UseProjectsByStatusDataReturn = {
  projects: Project[];
  showSkeleton: boolean;
  /** True while QuickBooks financial data is still loading in the background (projects are already rendered). */
  financialsLoading: boolean;
  refetch: () => Promise<void>;
};

/** Projects de un progressStatus dado, sin importar el lead type (spans construction/plumbing/roofing). */
export function useProjectsByStatusData(
  status: ProjectProgressStatus,
): UseProjectsByStatusDataReturn {
  const { projects, showSkeleton, refetch } = useInstantProjects();
  const { financialsById, isLoading: financialsLoading } = useProjectsFinancials({
    enabled: !showSkeleton,
  });

  const filtered = useMemo(
    () =>
      (projects ?? [])
        .filter((project) => project.projectProgressStatus === status)
        .map((project) => mergeProjectFinancials(project, financialsById)),
    [projects, status, financialsById],
  );

  return {
    projects: filtered,
    showSkeleton,
    financialsLoading,
    refetch,
  };
}
