"use client";

import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SharedEntityName } from "@/components/shared/SharedEntityName";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/shared";
import { projectsKeys } from "@/project/application";
import type { Project } from "@/project/domain";
import { projectSharedElementTransition } from "../projectMotion";
import { useRouteSharedLayoutScope } from "@/shared/presentation/RouteMotionContext";
import { useSharedEntitySource } from "@/shared/presentation/SharedEntitySourceContext";

/**
 * Stand-in for ProjectDetailsPage. The real page is `container mx-auto p-6
 * space-y-6` with a back-button header and then a 2/3 + 1/3 grid
 * (`lg:grid-cols-3`, main column `lg:col-span-2`); this used to draw a symmetric
 * `md:grid-cols-2`, so the columns visibly resized when the data landed. It also
 * painted raw `bg-muted` blocks, which is the menu surface, not a placeholder
 * colour — everything goes through <Skeleton> now, on the shared shimmer.
 */
export function ProjectDetailsPageSkeleton() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const shouldReduceMotion = usePrefersReducedMotion();
  const sharedLayoutScope = useRouteSharedLayoutScope();
  const sourceLabels = useSharedEntitySource()?.labels;
  const projectId = Number(pathname.match(/^\/project\/(\d+)(?:\/|$)/)?.[1]);
  const cachedProject = Number.isSafeInteger(projectId)
    ? queryClient
        .getQueryData<Project[]>(projectsKeys.list())
        ?.find((project) => project.id === projectId)
    : undefined;
  const projectName = cachedProject?.lead.name
    ?? sourceLabels?.[`maros-project-name-${projectId}-desktop-${sharedLayoutScope}`]
    ?? sourceLabels?.[`maros-project-name-${projectId}-mobile-${sharedLayoutScope}`];
  const projectNumber = cachedProject?.lead.leadNumber
    ?? sourceLabels?.[`maros-project-number-${projectId}-desktop-${sharedLayoutScope}`]
    ?? sourceLabels?.[`maros-project-number-${projectId}-mobile-${sharedLayoutScope}`];

  return (
    <div className="container mx-auto space-y-6 px-4 py-4 sm:p-6">
      {/* Header: back button + title + subtitle, actions on the right. */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Skeleton className="size-9 rounded-md" />
          <div className="min-w-0 flex-1">
            {projectNumber ? (
              <h1 className="break-words text-2xl font-bold text-foreground [overflow-wrap:anywhere] sm:text-3xl">
                Project #
                <SharedEntityName transitionRole="detail"
                  layoutCrossfade={false}
                  layoutId={shouldReduceMotion ? undefined : `maros-project-number-${projectId}-desktop-${sharedLayoutScope}`}
                  transition={projectSharedElementTransition}
                  className="hidden xl:inline-block"
                >
                  {projectNumber}
                </SharedEntityName>
                <SharedEntityName transitionRole="detail"
                  layoutCrossfade={false}
                  layoutId={shouldReduceMotion ? undefined : `maros-project-number-${projectId}-mobile-${sharedLayoutScope}`}
                  transition={projectSharedElementTransition}
                  className="inline-block xl:hidden"
                >
                  {projectNumber}
                </SharedEntityName>
              </h1>
            ) : (
              <Skeleton className="h-8 w-64 max-w-full sm:h-9" />
            )}
            {projectName ? (
              <div className="group mt-1 flex min-w-0 flex-wrap items-center gap-1">
                <SharedEntityName as="p" transitionRole="detail"
                  layoutCrossfade={false}
                  layoutId={shouldReduceMotion ? undefined : `maros-project-name-${projectId}-desktop-${sharedLayoutScope}`}
                  transition={projectSharedElementTransition}
                  className="hidden min-w-0 break-words font-display text-xl font-semibold leading-tight text-foreground [overflow-wrap:anywhere] xl:block"
                >
                  {projectName}
                </SharedEntityName>
                <SharedEntityName as="p" transitionRole="detail"
                  layoutCrossfade={false}
                  layoutId={shouldReduceMotion ? undefined : `maros-project-name-${projectId}-mobile-${sharedLayoutScope}`}
                  transition={projectSharedElementTransition}
                  className="min-w-0 break-words font-display text-xl font-semibold leading-tight text-foreground [overflow-wrap:anywhere] xl:hidden"
                >
                  {projectName}
                </SharedEntityName>
                <Skeleton className="size-7 shrink-0 rounded-md" />
              </div>
            ) : (
              <Skeleton className="mt-1 h-6 w-48 max-w-full" />
            )}
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      <div aria-hidden="true" className="flex h-9 w-fit items-center gap-1 rounded-lg border border-line bg-elev-1 p-1">
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Skeleton className="size-4 rounded-sm" />
              Coste del proyecto
            </CardTitle>
            <CardDescription>
              Lo pagado según QuickBooks, en base caja, contra lo que se espera acabar pagando.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="skeleton-deferred grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SkeletonCard bodyHeight="h-64" />
          <SkeletonCard bodyHeight="h-48" />
        </div>
        <div className="space-y-6 lg:col-span-1">
          <SkeletonCard bodyHeight="h-40" />
          <SkeletonCard bodyHeight="h-56" />
        </div>
      </div>
    </div>
  );
}
