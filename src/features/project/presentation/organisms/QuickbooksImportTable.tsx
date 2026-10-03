"use client";

import { Fragment } from "react";
import { Loader2, PowerOff, RotateCcw, Unlink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QUICKBOOKS_IMPORT_PROJECT_NUMBER_MAX_LENGTH,
  type QuickbooksImportDecisionResult,
  type QuickbooksImportJob,
  type QuickbooksImportMatch,
  type QuickbooksImportRowPlan,
} from "@/project/domain";
import { formatCurrency } from "@/shared/utils";

import type { QuickbooksJobAction } from "../pages/useQuickbooksImportPageLogic";
import { QuickbooksImportCollisionPanel } from "../molecules/QuickbooksImportCollisionPanel";
import {
  describeImportStatus,
  IMPORT_BLOCKED_COPY,
  QuickbooksImportOutcomeBadge,
  QuickbooksImportStatusBadge,
} from "../molecules/QuickbooksImportStatus";

export type QuickbooksImportTableProps = {
  rows: QuickbooksImportRowPlan[];
  selectedIds: ReadonlySet<string>;
  onToggleRow: (qboCustomerId: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  onProjectNumberChange: (qboCustomerId: string, projectNumber: string) => void;
  onResetProjectNumber: (qboCustomerId: string) => void;
  /** Destino elegido cuando el número casa con varios registros del CRM. */
  onLeadChoiceChange: (qboCustomerId: string, leadId: number) => void;
  resultsByJob: ReadonlyMap<string, QuickbooksImportDecisionResult>;
  showResults: boolean;
  isLoading: boolean;
  emptyMessage: string;
  canWrite: boolean;
  /** Desactivar escribe en la contabilidad, así que pide su propio permiso. */
  canDeactivate: boolean;
  onRequestAction: (action: QuickbooksJobAction, job: QuickbooksImportJob) => void;
  /** Job con una acción en vuelo: sus botones quedan fuera de alcance. */
  actingJobId: string | null;
};

export function QuickbooksImportTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  allSelected,
  someSelected,
  onProjectNumberChange,
  onResetProjectNumber,
  onLeadChoiceChange,
  resultsByJob,
  showResults,
  isLoading,
  emptyMessage,
  canWrite,
  canDeactivate,
  onRequestAction,
  actingJobId,
}: QuickbooksImportTableProps) {
  const columnCount = showResults ? 7 : 6;

  return (
    <div
      role="region"
      aria-label="Jobs de QuickBooks"
      tabIndex={0}
      className="overflow-x-auto overscroll-x-contain rounded-2xl border border-line bg-elev-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Table className="min-w-[79rem]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Seleccionar todo lo importable"
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={onToggleAll}
                disabled={!canWrite}
              />
            </TableHead>
            <TableHead className="min-w-72">Job de QuickBooks</TableHead>
            <TableHead className="w-56">Estado</TableHead>
            <TableHead className="w-72">Número del proyecto</TableHead>
            <TableHead className="w-32 text-right">Saldo</TableHead>
            <TableHead className="w-44">Acciones</TableHead>
            {showResults ? <TableHead className="w-56">Resultado</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-28 text-center text-fg-dim">
                <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden />
                Consultando los jobs de QuickBooks…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-28 text-center text-fg-dim">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((plan) => {
              const { job } = plan;
              const result = resultsByJob.get(job.qboCustomerId);
              const selected = selectedIds.has(job.qboCustomerId);
              const blocked = plan.blockedReason != null;

              return (
                <Fragment key={job.qboCustomerId}>
                  <TableRow className="align-top">
                    <TableCell>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => onToggleRow(job.qboCustomerId)}
                        disabled={!canWrite || (blocked && !selected)}
                        aria-label={`Seleccionar ${job.displayName}`}
                      />
                    </TableCell>

                    <TableCell className="min-w-72">
                      <div className="font-medium text-fg">{job.displayName}</div>
                      <div className="mt-1 text-xs text-fg-faint">
                        Job <span className="font-mono tabular-nums">{job.qboCustomerId}</span>
                        {job.parentName ? ` · ${job.parentName}` : ""}
                      </div>
                    </TableCell>

                    <TableCell className="w-56 space-y-1.5">
                      <QuickbooksImportStatusBadge status={job.status} />
                      <p className="text-xs text-fg-dim">{describeImportStatus(job)}</p>
                      {plan.blockedReason ? (
                        <p className="text-xs text-fg-faint">
                          {IMPORT_BLOCKED_COPY[plan.blockedReason]}
                        </p>
                      ) : null}
                    </TableCell>

                    <TableCell className="w-72 space-y-1.5">
                      <Input
                        value={plan.rawProjectNumber}
                        onChange={(event) =>
                          onProjectNumberChange(job.qboCustomerId, event.target.value)
                        }
                        maxLength={QUICKBOOKS_IMPORT_PROJECT_NUMBER_MAX_LENGTH}
                        placeholder="p. ej. 001R-0625 CO01"
                        disabled={!canWrite || job.importedProjectId != null}
                        aria-label={`Número del proyecto para ${job.displayName}`}
                        className="border-line-strong font-mono tabular-nums"
                      />
                      {plan.matchOptions.length > 1 ? (
                        <Select
                          value={String(plan.match?.leadId ?? "")}
                          onValueChange={(value) =>
                            onLeadChoiceChange(job.qboCustomerId, Number(value))
                          }
                          disabled={!canWrite}
                        >
                          <SelectTrigger
                            className="h-8 border-line-strong text-xs"
                            aria-label={`Registro del CRM para ${job.displayName}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {plan.matchOptions.map((option) => (
                              <SelectItem key={option.leadId} value={String(option.leadId)}>
                                {describeMatch(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}

                      <p className="text-xs text-fg-dim">
                        {job.importedProjectId != null
                          ? `Proyecto #${job.importedProjectId}`
                          : plan.match != null
                            ? `Se vincula a ${describeMatch(plan.match)}`
                            : "Se crea un lead y un proyecto nuevos"}
                      </p>
                      {plan.overridden ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto px-1.5 py-0.5 text-xs"
                          onClick={() => onResetProjectNumber(job.qboCustomerId)}
                        >
                          <RotateCcw className="mr-1 size-3" aria-hidden />
                          Volver a {job.projectNumber ?? "sin número"}
                        </Button>
                      ) : null}
                    </TableCell>

                    <TableCell className="w-32 text-right tabular-nums">
                      {formatCurrency(job.balance, 0)}
                    </TableCell>

                    <TableCell className="w-44 space-y-1.5">
                      {job.importedProjectId != null ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          disabled={!canWrite || actingJobId === job.qboCustomerId}
                          onClick={() => onRequestAction("desvincular", job)}
                        >
                          <Unlink className="mr-2 size-3.5" aria-hidden />
                          Desvincular
                        </Button>
                      ) : null}
                      {job.active ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start text-fg-dim"
                          disabled={!canDeactivate || actingJobId === job.qboCustomerId}
                          onClick={() => onRequestAction("desactivar", job)}
                        >
                          <PowerOff className="mr-2 size-3.5" aria-hidden />
                          Desactivar en QuickBooks
                        </Button>
                      ) : (
                        <p className="text-xs text-fg-faint">Inactivo en QuickBooks</p>
                      )}
                    </TableCell>

                    {showResults ? (
                      <TableCell className="w-56 space-y-1.5">
                        {result ? (
                          <>
                            <QuickbooksImportOutcomeBadge outcome={result.outcome} />
                            {result.projectId != null ? (
                              <p className="text-xs text-fg-dim">
                                Proyecto #{result.projectId}
                                {result.leadId != null ? ` · lead #${result.leadId}` : ""}
                              </p>
                            ) : null}
                            {result.reason ? (
                              <p className="text-xs text-fg-dim">{result.reason}</p>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-xs text-fg-faint">No iba en el lote</span>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>

                  {job.collidesWith.length > 0 ? (
                    <TableRow className="border-b">
                      <TableCell />
                      <TableCell colSpan={columnCount - 1} className="pb-4 pt-0">
                        <QuickbooksImportCollisionPanel
                          plan={plan}
                          canWrite={canWrite}
                          onUseSuggestion={(projectNumber) =>
                            onProjectNumberChange(job.qboCustomerId, projectNumber)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/** Número y nombre del registro del CRM: sin ellos, vincular es un acto de fe. */
function describeMatch(match: QuickbooksImportMatch): string {
  const record = match.leadNumber ?? `lead #${match.leadId}`;
  const target =
    match.projectId != null ? `proyecto #${match.projectId}` : "lead todavía sin proyecto";
  return `${record}${match.name ? ` · ${match.name}` : ""} · ${target}`;
}
