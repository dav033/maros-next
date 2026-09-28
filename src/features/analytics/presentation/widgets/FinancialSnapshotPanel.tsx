import Link from "next/link";
import { ArrowUpRight, ClipboardList, FileText, HandCoins, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialSnapshot } from "../../domain";
import { money } from "./formatters";

type FinancialSnapshotPanelProps = {
  snapshot: FinancialSnapshot;
};

const items = (snapshot: FinancialSnapshot) => [
  {
    label: "Estimated",
    value: snapshot.estimatedTotal,
    icon: ClipboardList,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    href: "/reports/quickbooks/estimated",
  },
  {
    label: "Invoiced",
    value: snapshot.invoicedTotal,
    icon: FileText,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    href: "/reports/quickbooks/invoiced",
  },
  {
    label: "Paid",
    value: snapshot.paidTotal,
    icon: HandCoins,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    href: "/reports/quickbooks/paid",
  },
  {
    label: "Project Outstanding",
    value: snapshot.outstandingTotal,
    icon: Wallet,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    href: "/reports/quickbooks/outstanding",
  },
];

export function FinancialSnapshotPanel({ snapshot }: FinancialSnapshotPanelProps) {
  return (
    <Card className="border-line">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">Financial Snapshot</CardTitle>
          <span className="rounded-full border border-line bg-elev-3 px-2.5 py-0.5 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">{snapshot.projectCount}</span> projects
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items(snapshot).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg border border-line-strong bg-elev-3 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-elev-4 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${item.bg} ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 truncate font-mono text-lg font-semibold tabular-nums">{money.format(item.value)}</p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
