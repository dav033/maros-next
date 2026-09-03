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
  const paid = toAmount(project.financial?.paidAmount);
  if (estimated === null || paid === null) return null;
  return estimated - paid;
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

function getPaymentScheduleLabel(project: Project): string | null {
  const items = project.financial?.paymentSchedule?.items ?? [];
  if (!items.length) return null;
  return items.map((item) => `${item.percentage}%`).join(" · ");
}

type MoneyTone = "violet" | "emerald" | "amber" | "rose";

// El proyecto es un solo tema oscuro (ver src/app/layout.tsx, .dark fijo en <html>),
// así que solo el color pensado para fondo oscuro llega a pintar; sin variante dark: muerta.
const MONEY_TONE_CLASSES: Record<MoneyTone, string> = {
  violet: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  rose: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

function MoneyPill({ value, tone }: { value: string; tone: MoneyTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-sm font-medium ring-1 ring-inset ${MONEY_TONE_CLASSES[tone]}`}
    >
      {value}
    </span>
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
        className: "w-[150px]",
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
          const scheduleLabel = getPaymentScheduleLabel(project);
          if ((!summary || summary.count === 0) && !scheduleLabel) {
            return <span className="text-muted-foreground">No payments</span>;
          }
          const paymentsLabel = summary && summary.count > 0
            ? `${formatCurrency(summary.totalAmount)} · ${summary.count} ${summary.count === 1 ? "payment" : "payments"}`
            : null;
          const scheduleFile = project.financial?.paymentSchedule?.source.fileName;
          return (
            <button
              type="button"
              className="text-left underline-offset-2 hover:underline"
              title={scheduleFile ? `Payment Schedule · ${scheduleFile}` : undefined}
              onClick={(event) => { event.stopPropagation(); onOpenPayments?.(project); }}
            >
              {scheduleLabel ? <span className="block font-mono text-sm">{scheduleLabel}</span> : null}
              {scheduleLabel ? <span className="block text-[11px] text-muted-foreground">Payment schedule</span> : null}
              {paymentsLabel ? <span className="block font-mono text-xs text-muted-foreground">{paymentsLabel}</span> : null}
            </button>
          );
        },
        sortable: true,
        sortValue: (project: Project) => getPaymentSummary(project)?.totalAmount ?? 0,
      } satisfies SimpleTableColumn<Project>] : []),
      {
        key: "estimate",
        header: "Estimate",
        className: "w-[150px]",
        render: (project: Project) => {
          const estimatedAmount = project.financial?.estimatedAmount;
          if (estimatedAmount === null || estimatedAmount === undefined) {
            return <span className="text-muted-foreground">-</span>;
          }
          const formatted = formatCurrency(estimatedAmount);
          if (formatted === "-") {
            return <span className="text-muted-foreground">-</span>;
          }
          return <MoneyPill value={formatted} tone="violet" />;
        },
        sortable: true,
        sortValue: (project: Project) => {
          const estimatedAmount = project.financial?.estimatedAmount;
          if (estimatedAmount === null || estimatedAmount === undefined) return 0;
          return typeof estimatedAmount === "number" ? estimatedAmount : parseFloat(String(estimatedAmount)) || 0;
        },
      },
      {
        // "Invoiced" = dinero ya cobrado en QuickBooks (paidAmount).
        key: "invoiced",
        header: "Invoiced",
        className: "w-[150px]",
        render: (project: Project) => {
          const paidAmount = project.financial?.paidAmount;
          if (paidAmount === null || paidAmount === undefined) {
            return <span className="text-muted-foreground">-</span>;
          }
          const formatted = formatCurrency(paidAmount);
          if (formatted === "-") {
            return <span className="text-muted-foreground">-</span>;
          }
          const paidPct = Math.max(0, Math.min(100, project.financial?.paidPercentage ?? 0));
          return (
            <div className="space-y-1" title={`${paidPct.toFixed(0)}% of invoiced amount collected`}>
              <MoneyPill value={formatted} tone="emerald" />
              <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500/80"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
            </div>
          );
        },
        sortable: true,
        sortValue: (project: Project) => {
          const paidAmount = project.financial?.paidAmount;
          if (paidAmount === null || paidAmount === undefined) return 0;
          return typeof paidAmount === "number" ? paidAmount : parseFloat(String(paidAmount)) || 0;
        },
      },
      {
        // "Backlog" = lo que falta por pagar del proyecto: Estimate − Invoiced.
        key: "backlog",
        header: "Backlog",
        className: "w-[150px]",
        render: (project: Project) => {
          const backlog = computeBacklog(project);
          if (backlog === null) {
            return <span className="text-muted-foreground">-</span>;
          }
          const formatted = formatCurrency(backlog);
          if (formatted === "-") {
            return <span className="text-muted-foreground">-</span>;
          }
          // Pendiente de cobrar → ámbar; saldado exacto → verde;
          // negativo (cobrado por encima del estimate) → rojo, para revisarlo.
          const tone: MoneyTone = backlog > 0 ? "amber" : backlog < 0 ? "rose" : "emerald";
          return <MoneyPill value={formatted} tone={tone} />;
        },
        sortable: true,
        sortValue: (project: Project) => computeBacklog(project) ?? 0,
      },
    ];
  }, [onOpenNotesModal, onOpenPayments, canReadFinance]);
}

