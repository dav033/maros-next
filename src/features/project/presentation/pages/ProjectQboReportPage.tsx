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
  ProfitAndLossDetail: "Pérdidas y ganancias (detalle)",
  ProfitAndLoss: "Pérdidas y ganancias",
  GeneralLedgerDetail: "Libro mayor (detalle)",
  AgedPayables: "Cuentas por pagar por antigüedad",
  VendorExpenses: "Gastos por proveedor",
  VendorBalanceDetail: "Saldo de proveedores (detalle)",
  CashFlow: "Flujo de caja",
  BalanceSheet: "Balance general",
};

const METHOD_LABELS: Record<QboAccountingMethod, string> = {
  Accrual: "Causación",
  Cash: "Efectivo",
};

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ReportError({ error, onRetry }: { error: AppError; onRetry: () => void }) {
  if (error.code === "PROJECT_NOT_LINKED_TO_QBO") {
    return (
      <Alert>
        <Link2Off className="size-4" />
        <AlertTitle>Este proyecto no está enlazado a un cliente de QuickBooks</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            {error.serverMessage ??
              "Vincúlalo con un cliente de QuickBooks para poder consultar sus reportes."}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/projects/import-from-quickbooks">Ir a la importación de QuickBooks</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (error.code === "QBO_REAUTHORIZATION_REQUIRED") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>La conexión con QuickBooks necesita autorizarse de nuevo</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            QuickBooks rechazó la sesión de la empresa. Un administrador tiene que volver a
            conectar QuickBooks; mientras tanto ningún reporte se puede consultar.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw className="size-4 mr-2" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>No pudimos traer el reporte</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error.userMessage}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw className="size-4 mr-2" />
          Reintentar
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="Volver al proyecto">
          <Link href={`/project/${projectId}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reporte de QuickBooks</h1>
          <p className="text-muted-foreground">
            Proyecto {data?.leadNumber ? `#${data.leadNumber}` : `#${projectId}`}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-6">
          <div className="space-y-2">
            <p className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Reporte
            </p>
            <Select value={report} onValueChange={(value) => setReport(value as QboReportName)}>
              <SelectTrigger className="h-10 w-[280px]">
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
          </div>

          <div className="space-y-2">
            <p className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Método contable
            </p>
            <div
              role="group"
              aria-label="Método contable"
              className="flex h-10 items-center gap-1 rounded-lg border border-line bg-elev-3 p-1"
            >
              {QBO_ACCOUNTING_METHODS.map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant={method === accountingMethod ? "default" : "ghost"}
                  size="sm"
                  aria-pressed={method === accountingMethod}
                  className="h-8 rounded-md px-3 text-xs"
                  onClick={() => setAccountingMethod(method)}
                >
                  {METHOD_LABELS[method]}
                </Button>
              ))}
            </div>
          </div>

          {pointInTime ? (
            <div className="space-y-2">
              <p className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fecha de corte
              </p>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-10 w-[170px]"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Desde
                </p>
                <Input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  aria-invalid={invertedDates}
                  className="h-10 w-[170px]"
                />
              </div>
              <div className="space-y-2">
                <p className="font-display text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Hasta
                </p>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  aria-invalid={invertedDates}
                  className="h-10 w-[170px]"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!canQuery ? (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Faltan fechas</AlertTitle>
          <AlertDescription>
            {invertedDates
              ? "La fecha inicial debe ser anterior o igual a la final."
              : "Elige las fechas del reporte para consultarlo."}
          </AlertDescription>
        </Alert>
      ) : error ? (
        <ReportError error={error} onRetry={() => void query.refetch()} />
      ) : query.isPending ? (
        <Card>
          <CardContent className="space-y-3 p-6">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
              <Skeleton key={row} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <p className="text-sm text-muted-foreground">
            {REPORT_LABELS[data.report]} · {METHOD_LABELS[data.accountingMethod]} ·{" "}
            {data.startDate ? `${data.startDate} → ${data.endDate}` : `al ${data.endDate}`} · cliente
            de QuickBooks {data.qboCustomerId}
          </p>
          {data.scope === "company" ? (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Estas cifras son de toda la empresa, no de este proyecto</AlertTitle>
              <AlertDescription>
                QuickBooks no acepta el filtro por cliente en este reporte: lo ignora y responde con
                los números de toda la empresa. El filtro se envía igual, pero lo que ves abajo no
                está acotado al proyecto #{data.leadNumber ?? data.projectId}.
              </AlertDescription>
            </Alert>
          ) : null}
          <Card>
            <CardContent className="p-0">
              <QboReportTable raw={data.raw} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
