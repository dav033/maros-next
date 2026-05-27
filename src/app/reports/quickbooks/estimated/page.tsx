"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { money } from "@/analytics";
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

function EstimatedReportContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const dashboardHref = `/dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  const { projects, isLoading, error } = useInstantProjects();

  const rows = useMemo(
    () =>
      (projects ?? [])
        .filter((project) => project.financial)
        .map((project) => ({
          projectId: Number(project.id) || 0,
          projectNumber: project.lead?.leadNumber ?? "—",
          estimatedAmount: project.financial?.estimatedAmount ?? 0,
          invoicedAmount: project.financial?.invoicedAmount ?? 0,
          paidAmount: project.financial?.paidAmount ?? 0,
          outstandingAmount: project.financial?.outstandingAmount ?? 0,
        })),
    [projects],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">QuickBooks Estimated Report</h1>
          <p className="text-sm text-muted-foreground">
            Project financial profile (estimated, invoiced, paid, outstanding) — same source as the Projects table.
          </p>
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
          <CardTitle className="text-sm">Estimated Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading estimated financials...</p>
          ) : error ? (
            <p className="text-sm text-destructive">Could not load estimated financials.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Number</TableHead>
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const href = row.projectId > 0 ? `/project/${row.projectId}` : undefined;
                  return (
                    <TableRow key={`${row.projectNumber}-${row.projectId}`}>
                      <TableCell>
                        {href ? <Link href={href} className="underline">{row.projectNumber}</Link> : row.projectNumber}
                      </TableCell>
                      <TableCell className="text-right">{money.format(row.estimatedAmount)}</TableCell>
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

export default function QuickbooksEstimatedReportPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <EstimatedReportContent />
    </Suspense>
  );
}
