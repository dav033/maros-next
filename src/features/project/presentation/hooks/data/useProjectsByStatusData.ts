"use client";

import { useMemo } from "react";
import { useInstantProjects } from "./useInstantProjects";
import { useProjectsFinancials } from "./useProjectsFinancials";
import type { Project, ProjectProgressStatus } from "@/project/domain";

export type UseProjectsByStatusDataReturn = {
  projects: Project[];
  showSkeleton: boolean;
  refetch: () => Promise<void>;
};

/** Projects de un progressStatus dado, sin importar el lead type (spans construction/plumbing/roofing). */
export function useProjectsByStatusData(
  status: ProjectProgressStatus,
): UseProjectsByStatusDataReturn {
  const { projects, showSkeleton, refetch } = useInstantProjects();
  const { financialsById } = useProjectsFinancials({ enabled: !showSkeleton });

  const filtered = useMemo(
    () =>
      (projects ?? [])
        .filter((project) => project.projectProgressStatus === status)
        .map((project) => {
          const entry = financialsById.get(project.id);
          if (!entry) return project;
          return { ...project, financial: entry.financial ?? undefined, qboError: entry.qboError };
        }),
    [projects, status, financialsById],
  );

  return {
    projects: filtered,
    showSkeleton,
    refetch,
  };
}
