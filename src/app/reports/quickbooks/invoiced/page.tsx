"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { money, useProjectFinancials } from "@/analytics";
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
  return value.replace(/^\[|\]$/g, "").trim().toUpperCase();
}

function InvoicedReportContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const dashboardHref = `/dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  const projectFinancials = useProjectFinancials(200);
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

  const rows = useMemo(
    () => [...(projectFinancials.data ?? [])].sort((a, b) => b.invoicedAmount - a.invoicedAmount),
    [projectFinancials.data],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">QuickBooks Invoiced Report</h1>
          <p className="text-sm text-muted-foreground">Projects ordered by invoiced amount</p>
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
          <CardTitle className="text-sm">Invoiced Details</CardTitle>
        </CardHeader>
        <CardContent>
          {projectFinancials.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading invoiced financials...</p>
          ) : projectFinancials.error ? (
            <p className="text-sm text-destructive">Could not load invoiced financials.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Number</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const projectId = projectNumberToId.get(normalizeProjectNumber(row.projectNumber));
                  const href = projectId ? `/project/${projectId}` : undefined;

                  return (
                    <TableRow key={row.projectNumber}>
                      <TableCell>
                        {href ? <Link href={href} className="underline">{row.projectNumber}</Link> : row.projectNumber}
                      </TableCell>
                      <TableCell className="text-right">{money.format(row.invoicedAmount)}</TableCell>
                      <TableCell className="text-right">{money.format(row.paidAmount)}</TableCell>
                      <TableCell className="text-right">{money.format(row.outstandingAmount)}</TableCell>
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

export default function QuickbooksInvoicedReportPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <InvoicedReportContent />
    </Suspense>
  );
}
