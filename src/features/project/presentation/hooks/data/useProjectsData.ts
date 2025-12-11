"use client";

import { useInstantProjects } from "./useInstantProjects";
import type { Project } from "@/project/domain";

export type UseProjectsDataReturn = {
  projects: Project[];
  showSkeleton: boolean;
  refetch: () => Promise<void>;
};

export function useProjectsData(): UseProjectsDataReturn {
  const { projects, showSkeleton, refetch } = useInstantProjects();

  return {
    projects: projects ?? [],
    showSkeleton,
    refetch,
  };
}

