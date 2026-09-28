"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Siren } from "lucide-react";
import {
  AsyncWidget,
  OutstandingBalancesPanel,
  ProjectHealthList,
  ProjectHealthSkeleton,
  TaskDashboardWidget,
  TopClientsSkeleton,
  useOutstandingBalances,
  useProjectHealth,
} from "@/analytics";
import { PageHeaderCard } from "@/components/shared/PageHeaderCard";
import { useHasPermission } from "@/shared/auth/useHasPermission";

/** Enough rows to act on without turning the landing page into the full report. */
const OUTSTANDING_ROWS = 5;

function HomeSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* Each signal lives in its own component so its query is only mounted for a user
   who is allowed to read it — an unpermitted section would just 403 on load. */

function ProjectsAtRisk() {
  const projectHealth = useProjectHealth();

  return (
    <AsyncWidget
      query={projectHealth}
      errorText="Could not load project health."
      skeleton={<ProjectHealthSkeleton />}
    >
      {(data) => <ProjectHealthList data={data} />}
    </AsyncWidget>
  );
}

function MoneyStillOut() {
  const outstanding = useOutstandingBalances(OUTSTANDING_ROWS);

  return (
    <AsyncWidget
      query={outstanding}
      errorText="Could not load outstanding balances."
      emptyText="Nothing invoiced is waiting to be collected."
      skeleton={<TopClientsSkeleton />}
    >
      {(data) => <OutstandingBalancesPanel data={data} />}
    </AsyncWidget>
  );
}

export default function HomePage() {
  const canReadTasks = useHasPermission("tasks:read");
  const canReadProjects = useHasPermission("projects:read");
  const canReadFinance = useHasPermission("finance:read");
  const hasAnySignal = canReadTasks || canReadProjects || canReadFinance;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <PageHeaderCard
        icon={Siren}
        title="What needs attention"
        description="Late work, projects at risk, and money still out."
        rightSlot={
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1 rounded-md border border-line-strong bg-elev-2 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Full dashboard
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        }
      />

      {canReadTasks ? (
        <HomeSection title="Open work">
          <TaskDashboardWidget />
        </HomeSection>
      ) : null}

      {canReadProjects ? (
        <HomeSection title="Projects at risk">
          <ProjectsAtRisk />
        </HomeSection>
      ) : null}

      {canReadFinance ? (
        <HomeSection title="Money still out">
          <MoneyStillOut />
        </HomeSection>
      ) : null}

      {!hasAnySignal ? (
        <p className="rounded-xl border border-dashed border-line bg-elev-1 p-6 text-center text-sm text-muted-foreground">
          No dashboards are enabled for your account. Open a section from the sidebar to get
          started.
        </p>
      ) : null}
    </div>
  );
}
