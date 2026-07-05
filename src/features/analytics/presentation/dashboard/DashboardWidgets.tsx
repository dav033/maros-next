import type { ReactNode } from "react";
import { Activity, BarChart3, DollarSign, Users } from "lucide-react";
import type {
  CostsBreakdown,
  ExpensesSummary,
  KpiOverview,
  LeadsPerMonthPoint,
  PipelineBucket,
  ProjectHealth,
  ProjectsStatusBucket,
  RevenuePoint,
  TopClient,
} from "../../domain";
import type { DashboardLeadScope } from "./DashboardFiltersBar";
import { AsyncWidget } from "../widgets/AsyncWidget";
import { CostsBreakdownPanel } from "../widgets/CostsBreakdownPanel";
import { KpiOverviewRow } from "../widgets/KpiOverviewRow";
import { LeadsPerMonthChart } from "../widgets/LeadsPerMonthChart";
import { PipelineFunnelChart } from "../widgets/PipelineFunnelChart";
import { ProjectHealthList } from "../widgets/ProjectHealthList";
import { ProjectsStatusChart } from "../widgets/ProjectsStatusChart";
import { RevenueTrendChart } from "../widgets/RevenueTrendChart";
import { TopClientsTable } from "../widgets/TopClientsTable";
import {
  BarChartSkeleton,
  CostsBreakdownSkeleton,
  KpiOverviewSkeleton,
  LineChartSkeleton,
  PieChartSkeleton,
  ProjectHealthSkeleton,
  TopClientsSkeleton,
} from "../widgets/WidgetStates";

type QueryLike<T> = {
  isLoading: boolean;
  isFetching?: boolean;
  error: unknown;
  data: T | undefined;
  refetch: () => Promise<unknown>;
};

type DashboardWidgetsProps = {
  overview: QueryLike<KpiOverview>;
  pipeline: QueryLike<PipelineBucket[]>;
  projectsStatus: QueryLike<ProjectsStatusBucket[]>;
  leadsPerMonth: QueryLike<LeadsPerMonthPoint[]>;
  costsBreakdown: QueryLike<CostsBreakdown>;
  revenueTrend: QueryLike<RevenuePoint[]>;
  topClients: QueryLike<TopClient[]>;
  topClientsBy: "revenue" | "volume";
  onTopClientsByChange: (by: "revenue" | "volume") => void;
  currentLeadScope: DashboardLeadScope;
  projectHealth: QueryLike<ProjectHealth[]>;
  expensesSummary: QueryLike<ExpensesSummary>;
  revenueRangeLabel?: string;
  revenueHref?: string;
};

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
  leadsPerMonth,
  costsBreakdown,
  revenueTrend,
  topClients,
  topClientsBy,
  onTopClientsByChange,
  currentLeadScope,
  projectHealth,
  expensesSummary,
  revenueRangeLabel,
  revenueHref,
}: DashboardWidgetsProps) {
  const showExpensesSummary = currentLeadScope === "all";
  return (
    <div className="space-y-8">
      <Section icon={Activity} title="Performance overview" description="Revenue, backlog and secured revenue" delay={0}>
        <AsyncWidget
          query={overview}
          errorText="Could not load overview KPIs."
          skeleton={<KpiOverviewSkeleton />}
        >
          {(overviewData) => (
            <KpiOverviewRow
              overview={overviewData}
              expensesSummary={showExpensesSummary ? expensesSummary.data ?? null : null}
              showExpensesSummary={showExpensesSummary}
              revenueRangeLabel={revenueRangeLabel}
              revenueHref={revenueHref}
            />
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

      <Section icon={BarChart3} title="Leads & projects" description="Monthly lead intake and project status mix" delay={220}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AsyncWidget
            query={leadsPerMonth}
            errorText="Could not load leads per month."
            emptyText="No leads found for this range."
            isEmpty={(data) => data.length === 0 || data.every((item) => item.count <= 0)}
            skeleton={<BarChartSkeleton />}
          >
            {(data) => <LeadsPerMonthChart data={data} />}
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

      {showExpensesSummary ? (
        <Section icon={DollarSign} title="Costs" description="All expenses and COGS by category" delay={270}>
          <AsyncWidget
            query={costsBreakdown}
            errorText="Could not load costs breakdown."
            emptyText="No cost data available for this range."
            isEmpty={(data) => data.categories.length === 0 && data.totalCosts === 0}
            skeleton={<CostsBreakdownSkeleton />}
          >
            {(data) => <CostsBreakdownPanel data={data} />}
          </AsyncWidget>
        </Section>
      ) : null}

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
