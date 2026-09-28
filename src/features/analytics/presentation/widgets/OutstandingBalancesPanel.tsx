"use client";

import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OutstandingBalanceItem } from "../../domain";
import { money } from "./formatters";
import { WidgetCardHeader } from "./WidgetCardHeader";

type OutstandingBalancesPanelProps = {
  data: OutstandingBalanceItem[];
};

export function OutstandingBalancesPanel({ data }: OutstandingBalancesPanelProps) {
  return (
    <Card className="border-line">
      <WidgetCardHeader
        icon={Wallet}
        iconBg="bg-elev-4"
        iconText="text-badge-amber"
        title="Outstanding Balances"
        subtitle="Invoiced and not yet collected"
        href="/reports/quickbooks/outstanding"
        hrefLabel="All balances"
      />
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-display text-xs uppercase tracking-wide text-muted-foreground">
                Client
              </TableHead>
              <TableHead className="font-display text-xs uppercase tracking-wide text-muted-foreground">
                Project
              </TableHead>
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Outstanding
              </TableHead>
              <TableHead className="font-display text-right text-xs uppercase tracking-wide text-muted-foreground">
                Oldest invoice
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={`${item.jobId}-${item.projectNumber ?? "none"}`}
                className="transition-colors hover:bg-elev-3"
              >
                <TableCell className="font-medium">{item.customerName}</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {item.projectNumber ?? "—"}
                </TableCell>
                <TableCell className="text-right font-mono font-medium tabular-nums">
                  {money.format(item.totalOutstanding)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {item.oldestInvoiceDate ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
