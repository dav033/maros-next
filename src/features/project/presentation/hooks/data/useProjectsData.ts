"use client";

import { useInstantProjects } from "./useInstantProjects";
import type { Project } from "@/project/domain";

export type UseProjectsDataReturn = {
  projects: Project[];
  showSkeleton: boolean;
  refetch: () => Promise<void>;
};

import type { ProjectsPageData } from "../../data/loadProjectsData";

export function useProjectsData(initialData?: ProjectsPageData): UseProjectsDataReturn {
  const { projects, showSkeleton, refetch } = useInstantProjects(initialData?.projects);

  return {
    projects: projects ?? [],
    showSkeleton,
    refetch,
  };
}

