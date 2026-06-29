import { BadgeDollarSign, Hammer, ShieldCheck, Wallet } from "lucide-react";
import type { CashPosition, KpiOverview } from "../../domain";
import { KpiCard, type KpiTone } from "./KpiCard";
import { money } from "./formatters";

type KpiOverviewRowProps = {
  overview: KpiOverview;
  cashPosition?: CashPosition | null;
  showCashPosition?: boolean;
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
  cashPosition,
  showCashPosition = false,
  revenueRangeLabel = "12m",
  revenueHref,
}: KpiOverviewRowProps) {
  const backlog = overview.revenueTotal - overview.revenuePipelineTotal;

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
      value: money.format(overview.revenuePipelineTotal),
      icon: ShieldCheck,
      tone: "violet",
      hint: "From P&L (Cash basis)",
    },
  ];

  if (showCashPosition) {
    kpis.push({
      key: "cashPosition",
      label: "Cash Position",
      value: cashPosition ? money.format(cashPosition.cashPosition) : "—",
      icon: Wallet,
      tone: "amber",
      hint: "Total bank balance",
    });
  }

  const gridCols = showCashPosition
    ? "sm:grid-cols-2 xl:grid-cols-4"
    : "sm:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-3 ${gridCols}`}>
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
