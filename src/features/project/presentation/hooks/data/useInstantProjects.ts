"use client";

import { useQuery } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import {
  projectsKeys,
  listProjects,
} from "@/project/application";
import type { Project } from "@/project/domain";
import { buildInstantQueryResult } from "@/shared/query";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

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

export function useInstantProjects(): UseInstantProjectsResult {
  const ctx = useProjectsApp();

  const query = useQuery<Project[], Error>({
    queryKey: projectsKeys.list(),
    queryFn: async () => {
      const items = await listProjects(ctx);
      return items ?? [];
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });

  const instant = buildInstantQueryResult<Project[]>(
    query,
    [],
    DEFAULT_STALE_TIME,
  );

  return {
    projects: instant.data,
    hasData: instant.hasData,
    isLoading: instant.isLoading,
    isFetching: instant.isFetching,
    showSkeleton: instant.showSkeleton,
    fromCache: instant.fromCache,
    error: instant.error,
    refetch: instant.refetch,
  };
}



