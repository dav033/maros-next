"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, FolderX } from "lucide-react";

import {
  DefaultTableLoading,
  EntityTable,
  NotesButton,
  type EntityContextMenuItem,
  type EntityTableGroupBy,
  type EntityTableSelection,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/shared/utils";
import { useHasPermission } from "@/shared/auth/useHasPermission";
import type { Project } from "@/project/domain";
import { getLeadTypeFromNumber } from "@/leads/domain";
import type { LeadType } from "@/leads/domain";
import {
  LEAD_TYPE_COLORS,
  LEAD_TYPE_LABELS,
  LEAD_TYPE_ORDER,
} from "@/features/leads/presentation/atoms/leadVisualTokens";

import { useProjectsTableColumns } from "../hooks/table/useProjectsTableColumns";
import type {
  ProjectGroupBy,
  UseProjectsTableLogicReturn,
} from "../hooks/table/useProjectsTableLogic";
import {
  INVOICE_COLORS,
  INVOICE_LABELS,
  PROGRESS_COLORS,
  PROGRESS_LABELS,
  PROGRESS_ORDER,
} from "./projectVisualTokens";

type MobileMetricTone = "emerald" | "rose" | "amber" | "violet";

const MOBILE_BAR_COLORS: Record<MobileMetricTone, string> = {
  emerald: "bg-emerald-500/80",
  rose: "bg-rose-500/80",
  amber: "bg-amber-500/80",
  violet: "bg-violet-500/80",
};

function toProjectAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const amount = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(amount) ? amount : null;
}

function MobileMetric({
  label,
  value,
  estimate,
  tone,
}: {
  label: string;
  value: number | null;
  estimate: number | null;
  tone: MobileMetricTone;
}) {
  const width = value !== null && estimate !== null && estimate > 0
    ? Math.min(100, (Math.abs(value) / estimate) * 100)
    : 0;
  const color = value !== null && value < 0 ? "rose" : tone;

  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-baseline justify-between gap-1">
        <span className="truncate text-[10px] text-muted-foreground">{label}</span>
        <span
          title={value === null ? undefined : formatCurrency(value)}
          className="truncate text-right font-mono text-xs font-medium tabular-nums"
        >
          {value === null ? "—" : formatCurrency(value)}
        </span>
      </div>
      <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${MOBILE_BAR_COLORS[color]}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ProjectMobileCard({
  project,
  canReadFinance,
  onOpenNotesModal,
  onOpenPayments,
}: {
  project: Project;
  canReadFinance: boolean;
  onOpenNotesModal?: (project: Project) => void;
  onOpenPayments?: (project: Project) => void;
}) {
  const estimate = toProjectAmount(project.financial?.estimatedAmount);
  const invoiced = toProjectAmount(project.financial?.invoicedAmount);
  const paymentAmount = project.paymentSummary?.totalAmount ?? project.financial?.paidAmount;
  // Cash basis: collected from the client vs. actually paid out.
  const collected = toProjectAmount(paymentAmount);
  const costPaid = toProjectAmount(project.financial?.cashOutPaid);
  const profit = collected !== null && costPaid !== null ? collected - costPaid : null;
  const backlog = estimate !== null && invoiced !== null ? estimate - invoiced : null;
  const costPaidExceedsCollected = costPaid !== null && collected !== null && costPaid > collected;
  const status = project.projectProgressStatus;
  const paymentSchedule = project.financial?.paymentSchedule;

  return (
    <div className="space-y-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {project.lead.leadNumber}
          </span>
          {status ? (
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px]"
              style={{ borderColor: PROGRESS_COLORS[status], color: PROGRESS_COLORS[status] }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: PROGRESS_COLORS[status] }} />
              {PROGRESS_LABELS[status] ?? status}
            </Badge>
          ) : null}
        </div>
        <Link
          href={`/project/${project.id}`}
          className="mt-1 block break-words text-sm font-semibold leading-snug text-foreground underline-offset-4 hover:underline"
        >
          {project.lead.name}
        </Link>
        {project.client ? (
          <p className="mt-1 break-words text-xs text-muted-foreground">
            <span>Client · </span>
            <Link
              href={project.client.type === "company" ? `/company/${project.client.id}` : `/contact/${project.client.id}`}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {project.client.name}
            </Link>
          </p>
        ) : null}
      </div>

      {canReadFinance ? (
        <div className="grid gap-3 border-y border-border/50 py-3 md:grid-cols-2">
          <section className="min-w-0 space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Estimate vs. cost
            </h3>
            <div className="space-y-2.5">
              <MobileMetric label="Estimate" value={estimate} estimate={estimate} tone="violet" />
              <MobileMetric label="Cost paid" value={costPaid} estimate={estimate} tone="rose" />
            </div>
          </section>
          <section className="min-w-0 space-y-2 border-t border-border/50 pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Billing &amp; profit
            </h3>
            <div className="space-y-2.5">
              <MobileMetric label="Collected" value={collected} estimate={estimate} tone="emerald" />
              <MobileMetric label="Profit" value={profit} estimate={estimate} tone="violet" />
              <MobileMetric
                label="Backlog"
                value={backlog}
                estimate={estimate}
                tone={backlog === 0 ? "emerald" : "amber"}
              />
            </div>
          </section>
        </div>
      ) : null}

      {costPaidExceedsCollected ? (
        <p className="text-xs font-medium text-destructive">Cost paid exceeds collected</p>
      ) : null}

      {canReadFinance || onOpenNotesModal ? (
        <div className="flex items-center gap-2">
          {canReadFinance && onOpenPayments ? (
            <button
              type="button"
              onClick={() => onOpenPayments(project)}
              className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-border/60 px-3 text-left text-xs hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex min-w-0 items-center gap-2">
                <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">Payments{paymentSchedule ? " · Schedule" : ""}</span>
              </span>
              <span className="shrink-0 font-mono font-medium tabular-nums">
                {paymentAmount == null ? "View details" : formatCurrency(paymentAmount)}
              </span>
            </button>
          ) : null}
          {onOpenNotesModal ? (
            <NotesButton
              hasNotes={project.notes.length > 0}
              notesCount={project.notes.length}
              onClick={() => onOpenNotesModal(project)}
              title="View notes"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function buildGroupBy(mode: ProjectGroupBy): EntityTableGroupBy<Project> | undefined {
  if (mode === "none") return undefined;
  if (mode === "progressStatus") {
    return {
      getKey: (p) => p.projectProgressStatus ?? "NOT_EXECUTED",
      getLabel: (key) => PROGRESS_LABELS[key] ?? key,
      getColor: (key) => PROGRESS_COLORS[key],
      order: PROGRESS_ORDER,
    };
  }
  if (mode === "invoiceStatus") {
    return {
      getKey: (p) => p.invoiceStatus ?? "NOT_EXECUTED",
      getLabel: (key) => INVOICE_LABELS[key] ?? key,
      getColor: (key) => INVOICE_COLORS[key],
    };
  }
  if (mode === "leadType") {
    return {
      getKey: (p) => getLeadTypeFromNumber(p.lead?.leadNumber) ?? "Unclassified",
      getLabel: (key) => LEAD_TYPE_LABELS[key as LeadType] ?? key,
      getColor: (key) => LEAD_TYPE_COLORS[key as LeadType],
      order: LEAD_TYPE_ORDER,
    };
  }
  return {
    getKey: (p) => p.lead?.projectType?.name ?? "Unclassified",
    getLabel: (key) => key,
  };
}

export interface ProjectsTableProps {
  tableLogic?: UseProjectsTableLogicReturn;
  isLoading?: boolean;
  projects?: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onOpenNotesModal?: (project: Project) => void;
  onOpenPayments?: (project: Project) => void;
  groupBy?: ProjectGroupBy;
  pagination?: { enabled?: boolean };
  selection?: EntityTableSelection;
}

export function ProjectsTable({
  tableLogic,
  isLoading = false,
  projects,
  onEdit,
  onDelete,
  onOpenNotesModal,
  onOpenPayments,
  groupBy = "none",
  pagination,
  selection,
}: ProjectsTableProps) {
  const isMutating = tableLogic?.isMutating;
  const router = useRouter();
  const canReadFinance = useHasPermission("finance:read");
  const rows = tableLogic?.rows ?? projects ?? [];
  const columns = useProjectsTableColumns({ onOpenNotesModal, onOpenPayments });

  const getContextMenuItems = useMemo<
    ((row: Project) => EntityContextMenuItem[]) | undefined
  >(() => {
    if (tableLogic?.getContextMenuItems) {
      return (row: Project) =>
        tableLogic.getContextMenuItems(row).map((item) => ({
          label: item.label,
          onClick: item.onClick,
          icon: item.icon,
          variant: item.variant,
          disabled: item.disabled,
          checked: item.checked,
          separator: item.separator,
          subItems: item.subItems,
        }));
    }
    if (onEdit || onDelete) {
      return (row: Project) => {
        const items: EntityContextMenuItem[] = [];
        if (onEdit) {
          items.push({
            label: "Edit",
            onClick: () => onEdit(row),
            icon: "lucide:edit",
          });
        }
        if (onDelete) {
          items.push({
            label: "Delete",
            onClick: () => onDelete(row),
            variant: "danger",
            icon: "lucide:trash",
          });
        }
        return items;
      };
    }
    return undefined;
  }, [tableLogic, onEdit, onDelete]);

  // Column widths from useProjectsTableColumns, plus optional checkbox/action cells.
  const tableMinWidth =
    (columns.some((column) => column.key === "payments") ? 1400 : 1230) +
    (selection ? 40 : 0) +
    (getContextMenuItems ? 40 : 0);

  return (
    <EntityTable<Project>
      data={rows}
      columns={columns}
      rowKey={(p) => p.id}
      isLoading={isLoading}
      isMutating={isMutating}
      getRowClassName={(project) => {
        const collected = project.paymentSummary?.totalAmount ?? project.financial?.paidAmount;
        const costPaid = project.financial?.cashOutPaid;
        return costPaid !== undefined && collected !== undefined && costPaid > collected
          ? "border-destructive/40 bg-destructive/10 hover:bg-destructive/20 [&>td:first-child]:border-l-2 [&>td:first-child]:border-l-destructive"
          : undefined;
      }}
      selection={selection}
      getContextMenuItems={getContextMenuItems}
      minWidth={tableMinWidth}
      mobileRender={(project) => (
        <ProjectMobileCard
          project={project}
          canReadFinance={canReadFinance}
          onOpenNotesModal={onOpenNotesModal}
          onOpenPayments={onOpenPayments}
        />
      )}
      onRowClick={(p) => p.id && router.push(`/project/${p.id}`)}
      getRowHref={(p) => (p.id ? `/project/${p.id}` : undefined)}
      groupBy={buildGroupBy(groupBy)}
      paginated={pagination?.enabled}
      defaultSort={{ key: "leadNumber", dir: "desc" }}
      loadingState={<DefaultTableLoading label="Loading projects…" />}
      emptyState={
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
          <FolderX className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get started by creating a new project.
          </p>
        </div>
      }
    />
  );
}
