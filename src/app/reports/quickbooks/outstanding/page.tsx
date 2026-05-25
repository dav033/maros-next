"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { money, useOutstandingBalances } from "@/analytics";
import { useInstantProjects } from "@/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function normalizeProjectNumber(value: string): string {
  return value
    .replace(/^\[|\]$/g, "")
    .trim()
    .toUpperCase();
}

function OutstandingReportContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const dashboardHref = `/dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  const outstanding = useOutstandingBalances(100);
  const { projects } = useInstantProjects();

  const projectNumberToId = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects ?? []) {
      const projectId = Number(project.id) || 0;
      if (projectId <= 0) continue;
      const number = project.lead?.leadNumber;
      if (!number) continue;
      map.set(normalizeProjectNumber(number), projectId);
    }
    return map;
  }, [projects]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">QuickBooks Outstanding Balances</h1>
          <p className="text-sm text-muted-foreground">Top outstanding balances by project</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={dashboardHref}>
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Outstanding Details</CardTitle>
        </CardHeader>
        <CardContent>
          {outstanding.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading outstanding balances...</p>
          ) : outstanding.error ? (
            <p className="text-sm text-destructive">Could not load outstanding balances.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project Number</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(outstanding.data ?? []).map((row) => {
                  const normalized = row.projectNumber ? normalizeProjectNumber(row.projectNumber) : "";
                  const projectId = normalized ? projectNumberToId.get(normalized) : undefined;
                  const href = projectId ? `/project/${projectId}` : undefined;
                  return (
                    <TableRow key={`${row.jobId}-${row.projectNumber ?? "none"}`}>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>
                        {href ? <Link href={href} className="underline">{row.projectNumber ?? "-"}</Link> : (row.projectNumber ?? "-")}
                      </TableCell>
                      <TableCell className="text-right">{money.format(row.totalInvoiced)}</TableCell>
                      <TableCell className="text-right">{money.format(row.totalOutstanding)}</TableCell>
                      <TableCell className="text-right">{row.invoiceCount}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function QuickbooksOutstandingReportPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <OutstandingReportContent />
    </Suspense>
  );
}
