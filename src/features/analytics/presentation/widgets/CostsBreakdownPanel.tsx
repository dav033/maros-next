"use client";

import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CostCategory, CostsBreakdown } from "../../domain";
import { money } from "./formatters";
import { WidgetCardHeader } from "./WidgetCardHeader";

type CostsBreakdownPanelProps = {
  data: CostsBreakdown;
};

type SectionSpec = {
  section: CostCategory["section"];
  label: string;
  total: number;
  dotClass: string;
  barClass: string;
};

function TotalTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function CategoryList({ spec, categories }: { spec: SectionSpec; categories: CostCategory[] }) {
  const items = categories.filter((item) => item.section === spec.section);
  const maxAmount = Math.max(...items.map((item) => Math.abs(item.amount)), 1);

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-sm ${spec.dotClass}`} />
          <p className="text-xs font-semibold text-foreground">{spec.label}</p>
        </div>
        <p className="text-xs font-medium text-muted-foreground">{money.format(spec.total)}</p>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No {spec.label.toLowerCase()} recorded for this period.
        </p>
      ) : (
        <ul className="max-h-[300px] space-y-2.5 overflow-y-auto pt-3">
          {items.map((item) => (
            <li key={item.category}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-xs text-foreground" title={item.category}>
                  {item.category}
                </p>
                <p className="shrink-0 text-xs font-medium tabular-nums text-foreground">
                  {money.format(item.amount)}
                </p>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted/40">
                <div
                  className={`h-full rounded-full ${spec.barClass}`}
                  style={{ width: `${Math.max((Math.abs(item.amount) / maxAmount) * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CostsBreakdownPanel({ data }: CostsBreakdownPanelProps) {
  const sections: SectionSpec[] = [
    {
      section: "EXPENSES",
      label: "Expenses",
      total: data.totalExpenses,
      dotClass: "bg-amber-500",
      barClass: "bg-amber-500",
    },
    {
      section: "COGS",
      label: "Cost of Goods Sold",
      total: data.totalCogs,
      dotClass: "bg-violet-500",
      barClass: "bg-violet-500",
    },
  ];

  return (
    <Card className="border-border/60">
      <WidgetCardHeader
        icon={Wallet}
        iconBg="bg-amber-500/10"
        iconText="text-amber-400"
        title="Costs Breakdown"
        subtitle={`Expenses and COGS by category · ${data.period.from} → ${data.period.to}`}
        href="/reports"
        hrefLabel="Reports"
      />
      <CardContent className="space-y-5 pt-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TotalTile label="Total Costs" value={money.format(data.totalCosts)} hint="Expenses + COGS" />
          <TotalTile label="Total Expenses" value={money.format(data.totalExpenses)} hint="From P&L (Cash basis)" />
          <TotalTile label="Cost of Goods Sold" value={money.format(data.totalCogs)} hint="From P&L (Cash basis)" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {sections.map((spec) => (
            <CategoryList key={spec.section} spec={spec} categories={data.categories} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
