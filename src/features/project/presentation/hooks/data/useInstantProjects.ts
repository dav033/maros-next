"use client";

import { useProjectsApp } from "@/di";
import { projectsKeys, listProjects } from "@/project/application";
import type { Project } from "@/project/domain";
import { useInstantList } from "@/shared/query";

export type UseInstantProjectsResult = {
  projects: Project[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

export function useInstantProjects(initialData?: Project[]): UseInstantProjectsResult {
  const ctx = useProjectsApp();
  const r = useInstantList<Project>({
    queryKey: projectsKeys.list(),
    queryFn: () => listProjects(ctx),
    initialData,
  });
  return { ...r, projects: r.data };
}
