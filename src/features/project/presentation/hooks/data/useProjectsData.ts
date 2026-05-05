"use client";

import { useMemo } from "react";
import { useInstantProjects } from "./useInstantProjects";
import type { Project } from "@/project/domain";
import { LeadType } from "@/leads/domain";
import { getLeadTypeFromNumber } from "@/features/leads/domain/utils/lead-type.utils";

export type UseProjectsDataReturn = {
  projects: Project[];
  showSkeleton: boolean;
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

  const projectsByType = useMemo(
    () =>
      (projects ?? []).filter(
        (project) => getLeadTypeFromNumber(project.lead?.leadNumber) === leadType,
      ),
    [projects, leadType],
  );

  return {
    projects: projectsByType,
    showSkeleton,
    refetch,
  };
}
