import { BadgeDollarSign, ClipboardList, FileText, HandCoins, Wallet } from "lucide-react";
import type { FinancialSnapshot, KpiOverview } from "../../domain";
import { KpiCard, type KpiTone } from "./KpiCard";
import { money } from "./formatters";

type KpiOverviewRowProps = {
  overview: KpiOverview;
  snapshot: FinancialSnapshot;
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
  snapshot,
  revenueRangeLabel = "12m",
  revenueHref,
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
      key: "estimated",
      label: "Estimated",
      value: money.format(snapshot.estimatedTotal),
      icon: ClipboardList,
      tone: "sky",
      href: "/reports/quickbooks/estimated",
    },
    {
      key: "invoiced",
      label: "Invoiced",
      value: money.format(snapshot.invoicedTotal),
      icon: FileText,
      tone: "violet",
      href: "/reports/quickbooks/estimated",
    },
    {
      key: "paid",
      label: "Paid",
      value: money.format(snapshot.paidTotal),
      icon: HandCoins,
      tone: "primary",
      href: "/reports/quickbooks/estimated",
    },
    {
      key: "projectOutstanding",
      label: "Project Outstanding",
      value: money.format(snapshot.outstandingTotal),
      icon: Wallet,
      tone: "amber",
      hint: `${snapshot.projectCount} projects`,
      href: "/reports/quickbooks/estimated",
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
