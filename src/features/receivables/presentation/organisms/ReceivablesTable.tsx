"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SharedEntityName } from "@/components/shared/SharedEntityName";
import { useRouteSharedLayoutScope } from "@/shared/presentation/RouteMotionContext";
import { sharedEntityReturnTransition } from "@/shared/presentation/motionTransitions";
import type { ReceivableProject } from "../../domain/types";
import { AgingBucketBadge } from "../atoms/AgingBucketBadge";
import { money } from "../atoms/money";

/** Rows arrive sorted by the backend (oldest debt first, undated last) and stay that way. */
export function ReceivablesTable({ projects }: { projects: ReceivableProject[] }) {
  const sharedLayoutScope = useRouteSharedLayoutScope();
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-elev-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Billed</TableHead>
            <TableHead className="text-right">Collected</TableHead>
            <TableHead className="text-right">Outstanding</TableHead>
            <TableHead className="text-right">Days</TableHead>
            <TableHead>Aging</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {project.leadNumber ? (
                  <>
                    <SharedEntityName
                      layoutCrossfade={false}
                      layoutId={`maros-project-number-${project.id}-desktop-${sharedLayoutScope}`}
                      transition={sharedEntityReturnTransition}
                      className="hidden xl:inline-block"
                    >
                      {project.leadNumber}
                    </SharedEntityName>
                    <SharedEntityName
                      layoutCrossfade={false}
                      layoutId={`maros-project-number-${project.id}-mobile-${sharedLayoutScope}`}
                      transition={sharedEntityReturnTransition}
                      className="inline-block xl:hidden"
                    >
                      {project.leadNumber}
                    </SharedEntityName>
                  </>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="max-w-[18rem]">
                <Link href={`/project/${project.id}`} className="truncate font-medium hover:underline">
                  {project.name ? (
                    <>
                      <SharedEntityName
                        layoutId={`maros-project-name-${project.id}-desktop-${sharedLayoutScope}`}
                        className="hidden xl:inline"
                      >
                        {project.name}
                      </SharedEntityName>
                      <SharedEntityName
                        layoutId={`maros-project-name-${project.id}-mobile-${sharedLayoutScope}`}
                        className="xl:hidden"
                      >
                        {project.name}
                      </SharedEntityName>
                    </>
                  ) : (
                    "Untitled project"
                  )}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {money(project.billedAmount)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {money(project.collectedAmount)}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold tabular-nums">
                {money(project.outstandingAmount)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {project.daysOutstanding ?? "—"}
              </TableCell>
              <TableCell>
                <AgingBucketBadge bucket={project.agingBucket} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
