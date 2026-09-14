"use client";

import type { SimpleTableColumn } from "@/types/table";
import Link from "next/link";

import * as React from "react";
import type { Project, ProjectProgressStatus } from "@/project/domain";
import { Badge } from "@/components/ui/badge";
import { NotesButton } from "@/components/shared";
import { formatCurrency } from "@/shared/utils";
import { PROGRESS_COLORS, PROGRESS_LABELS } from "../../organisms/projectVisualTokens";
import { useHasPermission } from "@/shared/auth/useHasPermission";

function ProjectStatusBadge({ status }: { status: ProjectProgressStatus }) {
  const label = PROGRESS_LABELS[status] ?? status;
  const color = PROGRESS_COLORS[status] ?? "hsl(var(--badge-neutral))";
  return (
    <Badge
      variant="outline"
      className="gap-1.5 text-xs"
      style={{ borderColor: color, color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </Badge>
  );
}

type UseProjectsTableColumnsOptions = {
  onOpenNotesModal?: (project: Project) => void;
  onOpenPayments?: (project: Project) => void;
};

function toAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function computeBacklog(project: Project): number | null {
  const estimated = toAmount(project.financial?.estimatedAmount);
  const invoiced = toAmount(project.financial?.invoicedAmount);
  if (estimated === null || invoiced === null) return null;
  return estimated - invoiced;
}

function getPaymentSummary(project: Project) {
  if (project.paymentSummary) return project.paymentSummary;
  const payments = project.financial?.payments;
  if (!payments) return null;
  return {
    count: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
    lastPaymentDate: payments.map((payment) => payment.date).filter(Boolean).sort().at(-1) ?? null,
    hasDetails: true,
  };
}

type ComparisonMetric = {
  label: string;
  value: number | null;
  tone: "emerald" | "rose" | "amber" | "violet";
};

const BAR_TONE_CLASSES = {
  emerald: "bg-emerald-500/80",
  rose: "bg-rose-500/80",
  amber: "bg-amber-500/80",
  violet: "bg-violet-500/80",
} as const;

function ComparisonBars({
  metrics,
  estimate,
}: {
  metrics: ComparisonMetric[];
  estimate: number | null;
}) {
  return (
    <div className="min-w-[190px] space-y-2">
      {metrics.map(({ label, value, tone }) => {
        if (value === null) {
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono text-muted-foreground">—</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted" />
            </div>
          );
        }

        const width = estimate && estimate > 0
          ? Math.min(100, (Math.abs(value) / estimate) * 100)
          : 0;
        const rowTone = value < 0 ? "rose" : tone;
        const formatted = formatCurrency(value);

        return (
          <div
            key={label}
            className="space-y-1"
            title={`${label}: ${formatted}${estimate && estimate > 0 ? ` (${width.toFixed(0)}% of estimate)` : ""}`}
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono font-medium text-foreground">{formatted}</span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={`${label} as a percentage of estimate`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={width}
            >
              <div
                className={`h-full rounded-full ${BAR_TONE_CLASSES[rowTone]}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useProjectsTableColumns(
  options?: UseProjectsTableColumnsOptions
): SimpleTableColumn<Project>[] {
  const { onOpenNotesModal } = options || {};
  const { onOpenPayments } = options || {};
  const canReadFinance = useHasPermission("finance:read");
  
  return React.useMemo<SimpleTableColumn<Project>[]>(() => {
    return [
      {
        key: "notes",
        header: "Notes",
        className: "w-[100px]",
        render: (project: Project) => {
          const notesArray = Array.isArray(project.notes) ? project.notes : [];
          if (!onOpenNotesModal) {
            return <span className="text-muted-foreground">-</span>;
          }
          return (
            <NotesButton
              hasNotes={notesArray.length > 0}
              notesCount={notesArray.length}
              onClick={() => onOpenNotesModal(project)}
              title="View notes"
            />
          );
        },
        sortable: false,
      },
      {
        key: "leadNumber",
        header: "Project Number",
        className: "w-[135px]",
        render: (project: Project) => (
          <span className="font-mono text-sm">{project.lead.leadNumber}</span>
        ),
        sortable: true,
        sortValue: (project: Project) => project.lead.leadNumber,
      },
      {
        key: "leadName",
        header: "Project Name",
        className: "w-[200px]",
        render: (project: Project) => (
          <span>{project.lead.name}</span>
        ),
        sortable: true,
        sortValue: (project: Project) => project.lead.name,
      },
      {
        key: "projectProgressStatus",
        header: "Progress Status",
        className: "w-[150px]",
        render: (project: Project) => {
          const status = project.projectProgressStatus;
          if (!status) return <span className="text-muted-foreground">-</span>;
          return <ProjectStatusBadge status={status} />;
        },
        sortable: true,
        sortValue: (project: Project) => project.projectProgressStatus || "",
      },
      {
        key: "client",
        header: "Client",
        className: "w-[180px]",
        render: (project: Project) => {
          const client = project.client;
          if (!client) return <span className="text-muted-foreground">—</span>;

          const href =
            client.type === "company"
              ? `/company/${client.id}`
              : `/contact/${client.id}`;

          return (
            <Link
              href={href}
              className="text-foreground hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {client.name}
            </Link>
          );
        },
        sortable: true,
        sortValue: (project: Project) => project.client?.name ?? "",
      },
      ...(canReadFinance ? [{
        key: "payments",
        header: "Payments",
        className: "w-[170px]",
        render: (project: Project) => {
          const summary = getPaymentSummary(project);
          const schedule = project.financial?.paymentSchedule;
          const paymentCount = summary?.count ?? 0;
          const hasPayments = paymentCount > 0;
          if (!hasPayments && !schedule) {
            return <span className="text-muted-foreground">No payments</span>;
          }
          const amount = hasPayments ? summary?.totalAmount : schedule?.totalAmount;
          const amountContext = hasPayments
            ? `${paymentCount} ${paymentCount === 1 ? "payment" : "payments"}`
            : "planned";
          const scheduleFile = project.financial?.paymentSchedule?.source.fileName;
          return (
            <button
              type="button"
              className="group flex min-w-0 flex-col items-start gap-1 text-left"
              title={scheduleFile ? `Payment Schedule · ${scheduleFile}` : undefined}
              onClick={(event) => { event.stopPropagation(); onOpenPayments?.(project); }}
            >
              {amount !== null && amount !== undefined ? (
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="whitespace-nowrap font-mono text-xs font-semibold tabular-nums text-foreground group-hover:underline">
                    {formatCurrency(amount)}
                  </span>
                  <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                    {amountContext}
                  </span>
                </span>
              ) : null}
              {schedule ? (
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-muted-foreground">
                  <span>Schedule</span>
                  <span className="whitespace-nowrap rounded-sm bg-muted/70 px-1.5 py-0.5 font-mono tabular-nums text-foreground">
                    {schedule.items.length} {schedule.items.length === 1 ? "stage" : "stages"}
                  </span>
                  {schedule.totalPercentage !== null ? (
                    <span className="whitespace-nowrap font-mono tabular-nums">
                      {schedule.totalPercentage}%
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        },
        sortable: true,
        sortValue: (project: Project) => getPaymentSummary(project)?.totalAmount ?? 0,
      } satisfies SimpleTableColumn<Project>] : []),
      {
        key: "estimateInvoicedCost",
        header: "Estimate / Invoiced / Cost",
        className: "w-[225px]",
        render: (project: Project) => (
          <ComparisonBars
            estimate={toAmount(project.financial?.estimatedAmount)}
            metrics={[
              { label: "Estimate", value: toAmount(project.financial?.estimatedAmount), tone: "violet" },
              { label: "Invoiced", value: toAmount(project.financial?.invoicedAmount), tone: "emerald" },
              { label: "Cost", value: toAmount(project.financial?.totalJobCost), tone: "rose" },
            ]}
          />
        ),
        sortable: true,
        sortValue: (project: Project) => toAmount(project.financial?.invoicedAmount) ?? 0,
      },
      {
        key: "profitVsBacklog",
        header: "Profit vs Backlog",
        className: "w-[225px]",
        render: (project: Project) => {
          const invoiced = toAmount(project.financial?.invoicedAmount);
          const cost = toAmount(project.financial?.totalJobCost);
          const profit = toAmount(project.financial?.grossProfit) ?? (
            invoiced !== null && cost !== null ? invoiced - cost : null
          );
          const backlog = computeBacklog(project);
          return (
            <ComparisonBars
              estimate={toAmount(project.financial?.estimatedAmount)}
              metrics={[
                { label: "Profit", value: profit, tone: "violet" },
                { label: "Backlog", value: backlog, tone: backlog === 0 ? "emerald" : "amber" },
              ]}
            />
          );
        },
        sortable: true,
        sortValue: (project: Project) => {
          const invoiced = toAmount(project.financial?.invoicedAmount);
          const cost = toAmount(project.financial?.totalJobCost);
          return toAmount(project.financial?.grossProfit) ?? (
            invoiced !== null && cost !== null ? invoiced - cost : 0
          );
        },
      },
    ];
  }, [onOpenNotesModal, onOpenPayments, canReadFinance]);
}

