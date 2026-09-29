"use client";

import { Activity, Sparkles, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiOverviewSkeleton, TopClientsSkeleton } from "../widgets";

/**
 * The dashboard's loading state. `dashboard/loading.tsx` used to draw a page
 * header the dashboard does not have, four KPI cards where it renders six, and
 * two chart cards and a six-row list that are not on this page at all — so the
 * skeleton and the page had almost nothing in common. This follows the real
 * tree: `space-y-6 pb-10` → DashboardFiltersBar → "Performance overview"
 * (KpiOverviewRow) → "Top Clients" (TopClientsTable).
 */
export function DashboardPageSkeleton() {
  return (
    <section className="space-y-6 pb-10">
      {/* DashboardFiltersBar: title row, scope pills, then the date controls. */}
      <header className="rounded-2xl border border-line bg-elev-1 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-container text-primary-on-container">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                A clear pulse of your business in one place
              </p>
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-end">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-40" />
        </div>
      </header>

      <SectionSkeleton icon={Activity} title="Performance overview" description="Revenue, backlog and secured revenue">
        <KpiOverviewSkeleton />
      </SectionSkeleton>

      <SectionSkeleton icon={Users} title="Top Clients" description="Top accounts in the active date range">
        <TopClientsSkeleton />
      </SectionSkeleton>
    </section>
  );
}

/** Same header strip DashboardWidgets' `Section` renders. */
function SectionSkeleton({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
