import type { ReactNode } from "react";
import { Activity, BarChart3, DollarSign, Hammer, House, Layers3, Users, Wrench } from "lucide-react";
import { LeadType } from "@/leads/domain";
import { Button } from "@/components/ui/button";
import type {
  AgingBucket,
  FinancialSnapshot,
  KpiOverview,
  PipelineBucket,
  ProjectHealth,
  ProjectsStatusBucket,
  RevenuePoint,
  TopClient,
} from "../../domain";
import type { DashboardLeadScope } from "./DashboardFiltersBar";
import { AgingBucketsChart } from "../widgets/AgingBucketsChart";
import { AsyncWidget } from "../widgets/AsyncWidget";
import { KpiOverviewRow } from "../widgets/KpiOverviewRow";
import { PipelineFunnelChart } from "../widgets/PipelineFunnelChart";
import { ProjectHealthList } from "../widgets/ProjectHealthList";
import { ProjectsStatusChart } from "../widgets/ProjectsStatusChart";
import { RevenueTrendChart } from "../widgets/RevenueTrendChart";
import { TopClientsTable } from "../widgets/TopClientsTable";
import {
  BarChartSkeleton,
  KpiOverviewSkeleton,
  LineChartSkeleton,
  PieChartSkeleton,
  ProjectHealthSkeleton,
  TopClientsSkeleton,
} from "../widgets/WidgetStates";

type QueryLike<T> = {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  refetch: () => Promise<unknown>;
};

type DashboardWidgetsProps = {
  overview: QueryLike<KpiOverview>;
  pipeline: QueryLike<PipelineBucket[]>;
  projectsStatus: QueryLike<ProjectsStatusBucket[]>;
  financialSnapshot: QueryLike<FinancialSnapshot>;
  aging: QueryLike<AgingBucket[]>;
  revenueTrend: QueryLike<RevenuePoint[]>;
  topClients: QueryLike<TopClient[]>;
  topClientsBy: "revenue" | "volume";
  onTopClientsByChange: (by: "revenue" | "volume") => void;
  currentLeadScope: DashboardLeadScope;
  onLeadScopeChange: (next: DashboardLeadScope) => void;
  projectHealth: QueryLike<ProjectHealth[]>;
  revenueRangeLabel?: string;
  revenueHref?: string;
};

const leadScopeShortcuts: Array<{
  value: DashboardLeadScope;
  label: string;
  icon: typeof Layers3;
}> = [
  { value: "all", label: "General", icon: Layers3 },
  { value: LeadType.CONSTRUCTION, label: "Construction", icon: Hammer },
  { value: LeadType.PLUMBING, label: "Plumbing", icon: Wrench },
  { value: LeadType.ROOFING, label: "Roofing", icon: House },
];

type SectionProps = {
  icon: typeof Activity;
  title: string;
  description: string;
  children: ReactNode;
  delay?: number;
};

function Section({ icon: Icon, title, description, children, delay = 0 }: SectionProps) {
  return (
    <section
      className="dashboard-section-enter space-y-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function DashboardWidgets({
  overview,
  pipeline,
  projectsStatus,
  financialSnapshot,
  aging,
  revenueTrend,
  topClients,
  topClientsBy,
  onTopClientsByChange,
  currentLeadScope,
  onLeadScopeChange,
  projectHealth,
  revenueRangeLabel,
  revenueHref,
}: DashboardWidgetsProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border/60 bg-card/35 p-2">
        <div className="flex flex-wrap gap-1">
          {leadScopeShortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            const isActive = shortcut.value === currentLeadScope;

            return (
              <Button
                key={shortcut.value}
                type="button"
                size="sm"
                variant={isActive ? "default" : "ghost"}
                className="h-8 gap-1.5 rounded-md px-3 text-xs"
                onClick={() => onLeadScopeChange(shortcut.value)}
              >
                <Icon className="h-3.5 w-3.5" />
                {shortcut.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Section icon={Activity} title="Performance overview" description="Key metrics across revenue and project financials" delay={0}>
        <AsyncWidget
          query={overview}
          errorText="Could not load overview KPIs."
          skeleton={<KpiOverviewSkeleton />}
        >
          {(overviewData) => (
            <AsyncWidget
              query={financialSnapshot}
              errorText="Could not load financial snapshot."
              skeleton={<KpiOverviewSkeleton />}
            >
              {(snapshotData) => (
                <KpiOverviewRow
                  overview={overviewData}
                  snapshot={snapshotData}
                  revenueRangeLabel={revenueRangeLabel}
                  revenueHref={revenueHref}
                />
              )}
            </AsyncWidget>
          )}
        </AsyncWidget>
      </Section>

      <Section icon={BarChart3} title="Revenue & pipeline" description="Trends and pipeline distribution" delay={120}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AsyncWidget
            query={revenueTrend}
            errorText="Could not load revenue trend."
            emptyText="No revenue data found for this range."
            skeleton={<LineChartSkeleton />}
          >
            {(data) => <RevenueTrendChart data={data} />}
          </AsyncWidget>

          <AsyncWidget
            query={pipeline}
            errorText="Could not load pipeline."
            emptyText="No pipeline data available."
            skeleton={<BarChartSkeleton />}
          >
            {(data) => <PipelineFunnelChart data={data} />}
          </AsyncWidget>
        </div>
      </Section>

      <Section icon={DollarSign} title="Financial health" description="Receivables aging and project status mix" delay={220}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AsyncWidget
            query={aging}
            errorText="Could not load aging report."
            emptyText="No aging data available."
            skeleton={<BarChartSkeleton />}
          >
            {(data) => <AgingBucketsChart data={data} />}
          </AsyncWidget>

          <AsyncWidget
            query={projectsStatus}
            errorText="Could not load project statuses."
            emptyText="No project status data available."
            isEmpty={(data) => data.length === 0 || data.every((item) => item.count <= 0)}
            skeleton={<PieChartSkeleton />}
          >
            {(data) => <ProjectsStatusChart data={data} />}
          </AsyncWidget>
        </div>
      </Section>

      <Section icon={Users} title="Clients & risk" description="Top accounts and projects that need attention" delay={320}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AsyncWidget
            query={topClients}
            errorText="Could not load top clients."
            emptyText="No top clients found for this period."
            skeleton={<TopClientsSkeleton />}
          >
            {(data) => (
              <TopClientsTable data={data} by={topClientsBy} onByChange={onTopClientsByChange} />
            )}
          </AsyncWidget>

          <AsyncWidget
            query={projectHealth}
            errorText="Could not load project health."
            skeleton={<ProjectHealthSkeleton />}
          >
            {(data) => <ProjectHealthList data={data} />}
          </AsyncWidget>
        </div>
      </Section>
    </div>
  );
}
