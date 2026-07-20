"use client";

import { useMemo } from "react";
import { useInstantProjects } from "./useInstantProjects";
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

  const filtered = useMemo(
    () => (projects ?? []).filter((project) => project.projectProgressStatus === status),
    [projects, status],
  );

  return {
    projects: filtered,
    showSkeleton,
    refetch,
  };
}
