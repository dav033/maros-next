import { BadgeDollarSign, BriefcaseBusiness, FolderKanban, Target, TrendingUp } from "lucide-react";
import type { KpiOverview } from "../../domain";
import { KpiCard, type KpiTone } from "./KpiCard";
import { money } from "./formatters";

type KpiOverviewRowProps = {
  overview: KpiOverview;
  revenueRangeLabel?: string;
  revenueHref?: string;
  outstandingHref?: string;
  backlogHref?: string;
};

type KpiSpec = {
  key: string;
  label: string;
  value: string;
  icon: typeof BadgeDollarSign;
  tone: KpiTone;
  hint?: string;
  href?: string;
};

export function KpiOverviewRow({
  overview,
  revenueRangeLabel = "12m",
  revenueHref,
  outstandingHref,
  backlogHref,
}: KpiOverviewRowProps) {
  const kpis: KpiSpec[] = [
    {
      key: "revenue",
      label: `Revenue (${revenueRangeLabel})`,
      value: money.format(overview.revenueTotal),
      icon: BadgeDollarSign,
      tone: "emerald",
      href: revenueHref ?? "/reports/quickbooks/revenue",
    },
    {
      key: "outstanding",
      label: "A/R Outstanding",
      value: money.format(overview.outstandingTotal),
      icon: TrendingUp,
      tone: "amber",
      href: outstandingHref ?? "/reports/quickbooks/outstanding",
    },
    {
      key: "backlog",
      label: "Backlog",
      value: money.format(overview.backlogTotal),
      icon: FolderKanban,
      tone: "sky",
      href: backlogHref ?? "/reports/quickbooks/backlog",
    },
    {
      key: "winRate",
      label: "Win Rate",
      value: `${overview.winRate.toFixed(1)}%`,
      icon: Target,
      hint: `${overview.wonLeadsCount} won · ${overview.lostLeadsCount} lost`,
      tone: "primary",
      href: "/leads",
    },
    {
      key: "leads",
      label: "Leads",
      value: overview.leadsCount.toString(),
      icon: BriefcaseBusiness,
      hint: `${overview.projectsCount} active projects`,
      tone: "violet",
      href: "/leads",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi, index) => (
        <div
          key={kpi.key}
          className="dashboard-kpi-enter"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <KpiCard
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            tone={kpi.tone}
            hint={kpi.hint}
            href={kpi.href}
          />
        </div>
      ))}
    </div>
  );
}
