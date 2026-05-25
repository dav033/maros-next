"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";
import {
  RevenueTrendChart,
  money,
  useOverview,
  useQuickbooksRevenueReport,
  useRevenueTrend,
} from "@/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DateRange = { from: string; to: string };

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultRange(): DateRange {
  const now = new Date();
  return {
    from: toDateString(new Date(now.getFullYear(), now.getMonth() - 11, 1)),
    to: toDateString(now),
  };
}

function isIsoDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function readRange(searchParams: URLSearchParams): DateRange {
  const fallback = getDefaultRange();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!isIsoDate(from) || !isIsoDate(to) || from > to) {
    return fallback;
  }

  return { from, to };
}

function RevenueReportContent() {
  const searchParams = useSearchParams();
  const range = useMemo(() => readRange(searchParams), [searchParams]);

  const overview = useOverview({ from: range.from, to: range.to });
  const revenueTrend = useRevenueTrend({ months: 12, from: range.from, to: range.to });
  const quickbooksRevenueReport = useQuickbooksRevenueReport({ from: range.from, to: range.to });

  const totalRevenue = useMemo(() => {
    const points = revenueTrend.data ?? [];
    return points.reduce((sum, point) => sum + point.revenue, 0);
  }, [revenueTrend.data]);

  const reportRows = useMemo(() => {
    const rows = quickbooksRevenueReport.data?.rows ?? [];
    return rows
      .filter((row) => row.label && Number.isFinite(row.amount) && Math.abs(row.amount) > 0)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 40);
  }, [quickbooksRevenueReport.data?.rows]);

  const dashboardHref = `/dashboard?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">QuickBooks Revenue Report</h1>
          <p className="text-sm text-muted-foreground">
            Revenue trend and totals for {range.from} to {range.to}
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={dashboardHref}>
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue ({range.from} to {range.to})</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <p className="text-2xl font-semibold">{money.format(totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {money.format(overview.data?.outstandingTotal ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Range</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {range.from} to {range.to}
          </CardContent>
        </Card>
      </div>

      {revenueTrend.isLoading ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">Loading revenue trend...</CardContent>
        </Card>
      ) : revenueTrend.error ? (
        <Card>
          <CardContent className="py-10 text-sm text-destructive">Could not load revenue trend.</CardContent>
        </Card>
      ) : (
        <RevenueTrendChart data={revenueTrend.data ?? []} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">QuickBooks Native Report (Profit & Loss Detail API)</CardTitle>
        </CardHeader>
        <CardContent>
          {quickbooksRevenueReport.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading native QuickBooks report...</p>
          ) : quickbooksRevenueReport.error ? (
            <p className="text-sm text-destructive">Could not load native QuickBooks report.</p>
          ) : reportRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rows returned for this range.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportRows.map((row, index) => (
                  <TableRow key={`${row.section}-${row.label}-${index}`}>
                    <TableCell className="text-muted-foreground">{row.section || "-"}</TableCell>
                    <TableCell>{row.label}</TableCell>
                    <TableCell className="text-right font-medium">{money.format(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function QuickbooksRevenueReportPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <RevenueReportContent />
    </Suspense>
  );
}
