"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Link2Off, RotateCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AppError } from "@/shared/errors";
import {
  isPointInTimeReport,
  QBO_ACCOUNTING_METHODS,
  QBO_REPORT_NAMES,
  type QboAccountingMethod,
  type QboReportName,
  type QboReportParams,
} from "@/project/domain";

import { useProjectQboReport } from "../hooks/data/useProjectQboReport";
import { QboReportTable } from "../organisms/QboReportTable";

const REPORT_LABELS: Record<QboReportName, string> = {
  ProfitAndLossDetail: "Profit and Loss Detail",
  ProfitAndLoss: "Profit and Loss",
  GeneralLedgerDetail: "General Ledger Detail",
  AgedPayables: "Aged Payables",
  VendorExpenses: "Vendor Expenses",
  VendorBalanceDetail: "Vendor Balance Detail",
  CashFlow: "Statement of Cash Flows",
  BalanceSheet: "Balance Sheet",
};

const METHOD_LABELS: Record<QboAccountingMethod, string> = {
  Accrual: "Accrual",
  Cash: "Cash",
};

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ReportError({
  error,
  onRetry,
  projectId,
}: {
  error: AppError;
  onRetry: () => void;
  projectId: number;
}) {
  if (error.code === "PROJECT_NOT_LINKED_TO_QBO") {
    return (
      <Alert>
        <Link2Off className="size-4" />
        <AlertTitle>
          There is no QuickBooks customer for this project
        </AlertTitle>
        <AlertDescription className="space-y-3">
          {/* El backend ya intentó las dos vías antes de llegar aquí: el vínculo
              guardado y, si no lo hay, el job cuyo nombre lleva el número del
              proyecto. Este aviso ya no significa "falta importarlo", significa
              que ninguna de las dos encontró nada — por eso manda a enlazarlo a
              mano desde la ficha, que es lo único que resuelve el caso. */}
          <p>
            {error.serverMessage ??
              "This project has no linked QuickBooks job, and no job name carries its project number."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/project/${projectId}`}>Link it from the project page</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects/import-from-quickbooks">Go to the QuickBooks import</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (error.code === "QBO_REAUTHORIZATION_REQUIRED") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>The QuickBooks connection has to be authorized again</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            QuickBooks rejected the company session. An administrator has to reconnect
            QuickBooks; until then no report can be read.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw className="size-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>We could not load the report</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error.userMessage}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw className="size-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function ProjectQboReportPage({ projectId }: { projectId: number }) {
  const [report, setReport] = useState<QboReportName>("ProfitAndLossDetail");
  const [accountingMethod, setAccountingMethod] = useState<QboAccountingMethod>("Accrual");
  const [startDate, setStartDate] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState(() => toDateString(new Date()));

  const pointInTime = isPointInTimeReport(report);
  const invertedDates = !pointInTime && Boolean(startDate) && Boolean(endDate) && startDate > endDate;
  const canQuery = pointInTime
    ? Boolean(endDate)
    : Boolean(startDate) && Boolean(endDate) && !invertedDates;

  const params = useMemo<QboReportParams>(
    () =>
      pointInTime
        ? { report, accountingMethod, endDate }
        : { report, accountingMethod, startDate, endDate },
    [pointInTime, report, accountingMethod, startDate, endDate],
  );

  const query = useProjectQboReport(projectId, params, { enabled: canQuery });
  const data = query.data;
  const error = query.error ? AppError.from(query.error) : null;

  return (
    <div className="container mx-auto space-y-3 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button asChild variant="ghost" size="icon" aria-label="Back to the project">
          <Link href={`/project/${projectId}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">QuickBooks report</h1>
        <p className="text-sm text-muted-foreground">
          Project {data?.leadNumber ? `#${data.leadNumber}` : `#${projectId}`}
        </p>
      </div>

      <Card>
        {/* Los rótulos "Report" y "Accounting method" repetían lo que el propio
            control ya dice en su valor, así que sólo viven como nombre accesible;
            las fechas sí lo necesitan, y lo llevan al lado en vez de encima. */}
        <CardContent className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
          <Select value={report} onValueChange={(value) => setReport(value as QboReportName)}>
            <SelectTrigger aria-label="Report" className="h-8 w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QBO_REPORT_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {REPORT_LABELS[name]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div
            role="group"
            aria-label="Accounting method"
            className="flex h-8 items-center gap-1 rounded-lg border border-line bg-elev-3 p-0.5"
          >
            {QBO_ACCOUNTING_METHODS.map((method) => (
              <Button
                key={method}
                type="button"
                variant={method === accountingMethod ? "default" : "ghost"}
                size="sm"
                aria-pressed={method === accountingMethod}
                className="h-7 rounded-md px-2.5 text-xs"
                onClick={() => setAccountingMethod(method)}
              >
                {METHOD_LABELS[method]}
              </Button>
            ))}
          </div>

          {pointInTime ? (
            <label className="flex items-center gap-2">
              <span className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
                As of
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-8 w-[150px]"
              />
            </label>
          ) : (
            <>
              <label className="flex items-center gap-2">
                <span className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  From
                </span>
                <Input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  aria-invalid={invertedDates}
                  className="h-8 w-[150px]"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  To
                </span>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  aria-invalid={invertedDates}
                  className="h-8 w-[150px]"
                />
              </label>
            </>
          )}
        </CardContent>
      </Card>

      {!canQuery ? (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Missing dates</AlertTitle>
          <AlertDescription>
            {invertedDates
              ? "The start date has to be on or before the end date."
              : "Pick the report dates to run it."}
          </AlertDescription>
        </Alert>
      ) : error ? (
        <ReportError
          error={error}
          onRetry={() => void query.refetch()}
          projectId={projectId}
        />
      ) : query.isPending ? (
        <Card>
          <CardContent className="space-y-2 p-3">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
              <Skeleton key={row} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {data.linkSource === "project-number" ? (
            <Alert>
              <Link2Off className="size-4" />
              <AlertTitle>
                This report was resolved by project number, not by a stored link
              </AlertTitle>
              <AlertDescription>
                The project has no QuickBooks customer stored, so job{" "}
                <span className="font-mono">{data.qboCustomerId}</span> was used — its name
                carries the number {data.leadNumber ?? `#${data.projectId}`}, which is exactly
                what the rest of the project page already does. It works, but it is a match by
                name: link it from the project page to pin it down.
              </AlertDescription>
            </Alert>
          ) : null}
          {data.scope === "company" ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>These figures are company-wide, not this project's</AlertTitle>
              <AlertDescription>
                QuickBooks does not accept the customer filter on this report: it ignores it and
                answers with the whole company's numbers. The filter is sent anyway, but what you
                see below is not scoped to project #{data.leadNumber ?? data.projectId}.
              </AlertDescription>
            </Alert>
          ) : null}
          <Card>
            <CardContent className="p-0">
              {/* La procedencia del reporte deja de ser un párrafo suelto y pasa a
                  encabezar la tabla a la que describe. */}
              <p className="border-b border-line px-2 py-1.5 text-xs text-muted-foreground">
                {REPORT_LABELS[data.report]} · {METHOD_LABELS[data.accountingMethod]} ·{" "}
                {data.startDate ? `${data.startDate} → ${data.endDate}` : `as of ${data.endDate}`} ·
                QuickBooks customer {data.qboCustomerId}
              </p>
              <QboReportTable raw={data.raw} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
