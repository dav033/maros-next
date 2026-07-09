"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FolderX } from "lucide-react";

import {
  DefaultTableLoading,
  EntityTable,
  type EntityContextMenuItem,
  type EntityTableGroupBy,
} from "@/components/shared";
import type { Project } from "@/project/domain";

import { useProjectsTableColumns } from "../hooks/table/useProjectsTableColumns";
import type {
  ProjectGroupBy,
  UseProjectsTableLogicReturn,
} from "../hooks/table/useProjectsTableLogic";

const PROGRESS_LABELS: Record<string, string> = {
  NOT_EXECUTED: "Not Executed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  LOST: "Lost",
  POSTPONED: "Postponed",
  PERMITS: "Permits",
};

const PROGRESS_COLORS: Record<string, string> = {
  NOT_EXECUTED: "#6b7280",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  LOST: "#6b7280",
  POSTPONED: "#f59e0b",
  PERMITS: "#8b5cf6",
};

const INVOICE_LABELS: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  NOT_EXECUTED: "Not Executed",
  PERMITS: "Permits",
};

const INVOICE_COLORS: Record<string, string> = {
  PAID: "#22c55e",
  PENDING: "#f59e0b",
  NOT_EXECUTED: "#6b7280",
  PERMITS: "#8b5cf6",
};

const PROGRESS_ORDER = [
  "IN_PROGRESS",
  "NOT_EXECUTED",
  "PERMITS",
  "POSTPONED",
  "COMPLETED",
  "LOST",
];

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
  groupBy?: ProjectGroupBy;
  pagination?: { enabled?: boolean };
}

export function ProjectsTable({
  tableLogic,
  isLoading = false,
  projects,
  onEdit,
  onDelete,
  onOpenNotesModal,
  groupBy = "none",
  pagination,
}: ProjectsTableProps) {
  const router = useRouter();
  const rows = tableLogic?.rows ?? projects ?? [];
  const columns = useProjectsTableColumns({ onOpenNotesModal });

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

  return (
    <EntityTable<Project>
      data={rows}
      columns={columns}
      rowKey={(p) => p.id}
      isLoading={isLoading}
      getContextMenuItems={getContextMenuItems}
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
