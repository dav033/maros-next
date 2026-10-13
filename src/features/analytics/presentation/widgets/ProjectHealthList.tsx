"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, ShieldCheck, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SharedEntityName } from "@/components/shared/SharedEntityName";
import { useRouteSharedLayoutScope } from "@/shared/presentation/RouteMotionContext";
import { sharedEntityReturnTransition } from "@/shared/presentation/motionTransitions";
import type { ProjectHealth } from "../../domain";
import { WidgetCardHeader } from "./WidgetCardHeader";

type ProjectHealthListProps = {
  data: ProjectHealth[];
};

const riskStyles: Record<
  ProjectHealth["riskLevel"],
  { badge: string; border: string; dot: string }
> = {
  low: {
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    border: "border-l-emerald-500",
    dot: "bg-emerald-400",
  },
  medium: {
    badge: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    border: "border-l-amber-500",
    dot: "bg-amber-400",
  },
  high: {
    badge: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    border: "border-l-rose-500",
    dot: "bg-rose-400",
  },
};

export function ProjectHealthList({ data }: ProjectHealthListProps) {
  const sharedLayoutScope = useRouteSharedLayoutScope();
  const hasAlerts = data.length > 0;

  return (
    <Card className="border-line">
      <WidgetCardHeader
        icon={Siren}
        iconBg="bg-rose-500/10"
        iconText="text-rose-400"
        title="Project Health Alerts"
        subtitle={
          hasAlerts
            ? `${data.length} project${data.length === 1 ? "" : "s"} need attention`
            : "All projects are on track"
        }
        href="/projects"
        hrefLabel="Projects"
      />
      <CardContent className="space-y-3">
        {!hasAlerts ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-foreground">No risk alerts at the moment</p>
            <p className="text-xs text-muted-foreground">All your projects look healthy.</p>
          </div>
        ) : (
          data.map((item) => {
            const styles = riskStyles[item.riskLevel];
            const hasLink = item.projectId > 0;
            const hasMatchingProjectName =
              item.projectName.trim().length > 0 &&
              item.projectName.trim() !== item.projectNumber.trim();
            const href = hasLink ? `/project/${item.projectId}` : "#";

            const inner = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {hasMatchingProjectName ? (
                        <>
                          <SharedEntityName
                            layoutId={`maros-project-name-${item.projectId}-desktop-${sharedLayoutScope}`}
                            className="hidden xl:inline"
                          >
                            {item.projectName}
                          </SharedEntityName>
                          <SharedEntityName
                            layoutId={`maros-project-name-${item.projectId}-mobile-${sharedLayoutScope}`}
                            className="xl:hidden"
                          >
                            {item.projectName}
                          </SharedEntityName>
                        </>
                      ) : (
                        item.projectName
                      )}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {hasLink && item.projectNumber.trim() ? (
                        <>
                          <SharedEntityName
                            layoutCrossfade={false}
                            layoutId={`maros-project-number-${item.projectId}-desktop-${sharedLayoutScope}`}
                            transition={sharedEntityReturnTransition}
                            className="hidden xl:inline-block"
                          >
                            {item.projectNumber}
                          </SharedEntityName>
                          <SharedEntityName
                            layoutCrossfade={false}
                            layoutId={`maros-project-number-${item.projectId}-mobile-${sharedLayoutScope}`}
                            transition={sharedEntityReturnTransition}
                            className="inline-block xl:hidden"
                          >
                            {item.projectNumber}
                          </SharedEntityName>
                        </>
                      ) : (
                        item.projectNumber
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`font-display text-xs font-semibold uppercase tracking-wide ${styles.badge}`}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                      {item.riskLevel}
                    </Badge>
                    {hasLink ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    ) : null}
                  </div>
                </div>
                <ul className="mt-2 space-y-1">
                  {item.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </>
            );

            const baseClasses = `group block rounded-lg border border-line-strong border-l-4 bg-elev-3 p-3 transition-all ${styles.border} ${
              hasLink
                ? "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-elev-4 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                : ""
            }`;

            if (!hasLink) {
              return (
                <div key={`${item.projectId}-${item.projectNumber}`} className={baseClasses}>
                  {inner}
                </div>
              );
            }

            return (
              <Link key={`${item.projectId}-${item.projectNumber}`} href={href} className={baseClasses}>
                {inner}
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
