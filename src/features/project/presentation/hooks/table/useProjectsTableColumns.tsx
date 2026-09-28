"use client";

import type { SimpleTableColumn } from "@/types/table";
import Link from "next/link";

import * as React from "react";
import type { Project, ProjectProgressStatus } from "@/project/domain";
import { Badge } from "@/components/ui/badge";
import { NotesButton } from "@/components/shared";
import { formatCurrency } from "@/shared/utils";
import { MoneyLine } from "../../molecules/MoneyLine";
import { LIST_AXIS_MAX_PERCENT } from "../../molecules/moneyLineGeometry";
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

// Cash basis: money actually received from the client and actually paid out.
function getCollected(project: Project): number | null {
  return toAmount(getPaymentSummary(project)?.totalAmount);
}

function getCashProfit(project: Project): number | null {
  const collected = getCollected(project);
  const costPaid = toAmount(project.financial?.cashOutPaid);
  return collected !== null && costPaid !== null ? collected - costPaid : null;
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
                  <span className="whitespace-nowrap rounded-sm bg-elev-4 px-1.5 py-0.5 font-mono tabular-nums text-foreground">
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
        // One axis instead of five bars: the track is the contract, and collected
        // and spent are drawn against it. Backlog is omitted here — the row only
        // has room for two lanes; the project card shows the third. The axis is
        // pinned so the contract marker lands on the same x in every row.
        key: "contractVsCash",
        header: "Collected / Spent vs contract",
        className: "w-[240px]",
        render: (project: Project) => (
          <MoneyLine
            estimate={toAmount(project.financial?.estimatedAmount)}
            collected={getCollected(project)}
            spent={toAmount(project.financial?.cashOutPaid)}
            axisMaxPercent={LIST_AXIS_MAX_PERCENT}
            label={project.lead.name}
          />
        ),
        sortable: true,
        // The cell reads as a share of the contract, so it sorts as one. Rows with no
        // usable contract have no share to sort by and fall back to raw dollars.
        sortValue: (project: Project) => {
          const collected = getCollected(project);
          if (collected === null) return 0;
          const estimate = toAmount(project.financial?.estimatedAmount);
          return estimate !== null && estimate > 0 ? collected / estimate : collected;
        },
      },
      {
        // Cash profit is a figure, not a bar: the money line already owns the bars,
        // but the number itself still has to be visible and sortable.
        key: "cashProfit",
        header: "Profit",
        className: "w-[110px]",
        render: (project: Project) => {
          const profit = getCashProfit(project);
          if (profit === null) return <span className="text-muted-foreground">—</span>;
          return (
            <span
              className="font-mono text-xs font-semibold tabular-nums"
              style={{ color: profit < 0 ? "var(--money-over)" : undefined }}
            >
              {formatCurrency(profit)}
            </span>
          );
        },
        sortable: true,
        sortValue: (project: Project) => getCashProfit(project) ?? 0,
      },
    ];
  }, [onOpenNotesModal, onOpenPayments, canReadFinance]);
}

