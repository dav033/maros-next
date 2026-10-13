"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { projectsKeys } from "@/project/application";
import type { ProjectFinancialsEntry } from "@/project/domain";
import { useHasPermission } from "@/shared/auth/useHasPermission";
import { ProjectDetailsPageSkeleton } from "../components/ProjectDetailsPageSkeleton";
import { useProjectsFinancials } from "../hooks/data/useProjectsFinancials";
import { useInstantProjects } from "../hooks/data/useInstantProjects";
import { projectDetailsFromList } from "../data/projectDetailsFromList";
import { ProjectDetailsPage } from "./ProjectDetailsPage";

export function ProjectDetailsRoute({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient();
  const canReadFinance = useHasPermission("finance:read");
  const [initialCache] = useState(() => {
    const financialsQueryKey = projectsKeys.financials();
    const cachedFinancials = queryClient.getQueryData<ProjectFinancialsEntry[]>(financialsQueryKey);

    return {
      hasFinancialSummary:
        cachedFinancials?.some((entry) => entry.id === projectId) ?? false,
      financialsInvalidated:
        queryClient.getQueryState(financialsQueryKey)?.isInvalidated ?? false,
    };
  });
  const { projects, showSkeleton, error, isFetching, refetch } = useInstantProjects();
  const project = projects?.find((candidate) => candidate.id === projectId);
  const { financialsById } = useProjectsFinancials({
    // Reuse this project's cached summary. If it was not ready when the user
    // opened the detail, share the list request or fetch it once on demand.
    enabled: canReadFinance && Boolean(project),
    poll: false,
    refetchOnMount:
      initialCache.hasFinancialSummary && !initialCache.financialsInvalidated
        ? false
        : "always",
    refetchOnWindowFocus: false,
  });
  const projectDetails = useMemo(
    () =>
      project
        ? projectDetailsFromList(
            project,
            financialsById.get(projectId)?.financial,
            { canReadFinance },
          )
        : null,
    [canReadFinance, project, projectId, financialsById],
  );

  if (showSkeleton || (!project && isFetching)) return <ProjectDetailsPageSkeleton />;

  if (!projectDetails) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading project</CardTitle>
            <CardDescription>
              {error?.message ?? "No encontramos el proyecto solicitado."}
            </CardDescription>
            {error ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                {isFetching ? "Retrying…" : "Retry"}
              </Button>
            ) : null}
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ProjectDetailsPage
      projectId={projectId}
      initialData={{ projectDetails }}
    />
  );
}
