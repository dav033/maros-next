"use client";

import { Badge } from "@/components/ui/badge";
import type { SimpleTableColumn } from "@/types/table";

import * as React from "react";
import type { Project } from "@/project/domain";
import { NotesButton } from "@/components/custom";
import { ProjectProgressStatus, InvoiceStatus } from "@/project/domain";
import { formatCurrency } from "@/shared/utils";

type UseProjectsTableColumnsOptions = {
  onOpenNotesModal?: (project: Project) => void;
};

export function useProjectsTableColumns(
  options?: UseProjectsTableColumnsOptions
): SimpleTableColumn<Project>[] {
  const { onOpenNotesModal } = options || {};
  
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
          
          const statusLabels: Record<ProjectProgressStatus, string> = {
            [ProjectProgressStatus.NOT_EXECUTED]: "Not Executed",
            [ProjectProgressStatus.IN_PROGRESS]: "In Progress",
            [ProjectProgressStatus.COMPLETED]: "Completed",
            [ProjectProgressStatus.LOST]: "Lost",
            [ProjectProgressStatus.POSTPONED]: "Postponed",
            [ProjectProgressStatus.PERMITS]: "Permits",
          };
          
          return <span>{statusLabels[status] || status}</span>;
        },
        sortable: true,
        sortValue: (project: Project) => project.projectProgressStatus || "",
      },
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
          return <span>{formatted}</span>;
        },
        sortable: true,
        sortValue: (project: Project) => {
          const estimatedAmount = project.financial?.estimatedAmount;
          if (estimatedAmount === null || estimatedAmount === undefined) return 0;
          return typeof estimatedAmount === "number" ? estimatedAmount : parseFloat(String(estimatedAmount)) || 0;
        },
      },
      {
        key: "paidAmount",
        header: "Paid Amount",
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
          return <span>{formatted}</span>;
        },
        sortable: true,
        sortValue: (project: Project) => {
          const paidAmount = project.financial?.paidAmount;
          if (paidAmount === null || paidAmount === undefined) return 0;
          return typeof paidAmount === "number" ? paidAmount : parseFloat(String(paidAmount)) || 0;
        },
      },
      {
        key: "outstandingAmount",
        header: "Outstanding Amount",
        className: "w-[150px]",
        render: (project: Project) => {
          const outstandingAmount = project.financial?.outstandingAmount;
          if (outstandingAmount === null || outstandingAmount === undefined) {
            return <span className="text-muted-foreground">-</span>;
          }
          const formatted = formatCurrency(outstandingAmount);
          if (formatted === "-") {
            return <span className="text-muted-foreground">-</span>;
          }
          return <span>{formatted}</span>;
        },
        sortable: true,
        sortValue: (project: Project) => {
          const outstandingAmount = project.financial?.outstandingAmount;
          if (outstandingAmount === null || outstandingAmount === undefined) return 0;
          return typeof outstandingAmount === "number" ? outstandingAmount : parseFloat(String(outstandingAmount)) || 0;
        },
      },
    ];
  }, [onOpenNotesModal]);
}

