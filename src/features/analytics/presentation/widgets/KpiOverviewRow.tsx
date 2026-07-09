import {
  BadgeDollarSign,
  Hammer,
  Package,
  Receipt,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { ExpensesSummary, KpiOverview } from "../../domain";
import { KpiCard, type KpiTone } from "./KpiCard";
import { money } from "./formatters";
import { TooltipProvider } from "@/components/ui/tooltip";

type KpiOverviewRowProps = {
  overview: KpiOverview;
  expensesSummary?: ExpensesSummary | null;
  revenueRangeLabel?: string;
  revenueHref?: string;
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
  expensesSummary,
  revenueRangeLabel = "12m",
  revenueHref,
}: KpiOverviewRowProps) {
  const backlog = overview.revenueTotal - overview.revenuePipelineTotal;

  const kpis: KpiSpec[] = [
    {
      key: "revenue",
      label: `Revenue (${revenueRangeLabel})`,
      value: money.format(overview.revenuePipelineTotal),
      icon: BadgeDollarSign,
      tone: "emerald",
      href: revenueHref ?? "/reports/quickbooks/revenue",
    },
    {
      key: "backlog",
      label: "Backlog",
      value: money.format(backlog),
      icon: Hammer,
      tone: "sky",
      hint: "Revenue − Revenue Pipeline",
    },
    {
      key: "revenuePipeline",
      label: "Revenue Pipeline",
      value: money.format(overview.revenueTotal),
      icon: ShieldCheck,
      tone: "violet",
      hint: "From P&L (Cash basis)",
    },
    {
      key: "totalExpenses",
      label: "Total Expenses",
      value: expensesSummary ? money.format(expensesSummary.totalExpenses) : "—",
      icon: Receipt,
      tone: "amber",
      hint: "From P&L (Cash basis)",
    },
    {
      key: "totalCogs",
      label: "Cost of Goods Sold",
      value: expensesSummary ? money.format(expensesSummary.totalCogs) : "—",
      icon: Package,
      tone: "primary",
      hint: "From P&L (Cash basis)",
    },
    {
      key: "profit",
      label: "Profit",
      value: money.format(overview.profit),
      icon: TrendingUp,
      tone: overview.profit < 0 ? "rose" : "emerald",
      hint: "Net income (Cash basis). General uses company P&L; per-scope sums project-level P&Ls.",
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
    </TooltipProvider>
  );
}
