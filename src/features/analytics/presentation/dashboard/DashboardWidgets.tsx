import type { ReactNode } from "react";
import { Activity, Users } from "lucide-react";
import { Can } from "@/shared/auth/Can";
import type {
  ExpensesSummary,
  KpiOverview,
  TopClient,
} from "../../domain";
import { AsyncWidget } from "../widgets/AsyncWidget";
import { KpiOverviewRow } from "../widgets/KpiOverviewRow";
import { TopClientsTable } from "../widgets/TopClientsTable";
import {
  KpiOverviewSkeleton,
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
  topClients: QueryLike<TopClient[]>;
  topClientsBy: "revenue" | "volume";
  onTopClientsByChange: (by: "revenue" | "volume") => void;
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
  topClients,
  topClientsBy,
  onTopClientsByChange,
  expensesSummary,
  revenueRangeLabel,
  revenueHref,
}: DashboardWidgetsProps) {
  return (
    <div className="space-y-8">
      <Can permission="finance:read">
        <Section icon={Activity} title="Performance overview" description="Revenue, backlog and secured revenue" delay={0}>
          <AsyncWidget
            query={overview}
            errorText="Could not load overview KPIs."
            skeleton={<KpiOverviewSkeleton />}
          >
            {(overviewData) => (
              <KpiOverviewRow
                overview={overviewData}
                expensesSummary={expensesSummary.data ?? null}
                revenueRangeLabel={revenueRangeLabel}
                revenueHref={revenueHref}
              />
            )}
          </AsyncWidget>
        </Section>
      </Can>

      <Can permission="finance:read">
        <Section icon={Users} title="Top Clients" description="Top accounts in the active date range" delay={120}>
          <AsyncWidget query={topClients} errorText="Could not load top clients." emptyText="No top clients found for this period." skeleton={<TopClientsSkeleton />}>
            {(data) => <TopClientsTable data={data} by={topClientsBy} onByChange={onTopClientsByChange} />}
          </AsyncWidget>
        </Section>
      </Can>
    </div>
  );
}
