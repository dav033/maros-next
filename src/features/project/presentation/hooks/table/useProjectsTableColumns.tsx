"use client";

import * as React from "react";
import type { Project } from "@/project/domain";
import type { SimpleTableColumn } from "@dav033/dav-components";
import { StatusBadge, NotesButton } from "@dav033/dav-components";
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
            return <span className="text-gray-400">-</span>;
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
        header: "Lead Number",
        className: "w-[150px]",
        render: (project: Project) => (
          <span className="font-mono text-sm">{project.lead.leadNumber}</span>
        ),
        sortable: true,
        sortValue: (project: Project) => project.lead.leadNumber,
      },
      {
        key: "leadName",
        header: "Lead Name",
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
          if (!status) return <span className="text-gray-400">-</span>;
          
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
        key: "invoiceStatus",
        header: "Invoice Status",
        className: "w-[150px]",
        render: (project: Project) => {
          const status = project.invoiceStatus;
          if (!status) return <span className="text-gray-400">-</span>;
          
          const statusLabels: Record<InvoiceStatus, string> = {
            [InvoiceStatus.PAID]: "Paid",
            [InvoiceStatus.PENDING]: "Pending",
            [InvoiceStatus.NOT_EXECUTED]: "Not Executed",
            [InvoiceStatus.PERMITS]: "Permits",
          };
          
          return <span>{statusLabels[status] || status}</span>;
        },
        sortable: true,
        sortValue: (project: Project) => project.invoiceStatus || "",
      },
      {
        key: "invoiceAmount",
        header: "Invoice Amount",
        className: "w-[150px]",
        render: (project: Project) => {
          const formatted = formatCurrency(project.invoiceAmount);
          if (formatted === "-") {
            return <span className="text-gray-400">-</span>;
          }
          return <span>{formatted}</span>;
        },
        sortable: true,
        sortValue: (project: Project) => {
          const amount = project.invoiceAmount;
          if (amount === null || amount === undefined) return 0;
          return typeof amount === "number" ? amount : parseFloat(String(amount)) || 0;
        },
      },
      {
        key: "lastPayment",
        header: "Last Payment",
        className: "w-[150px]",
        render: (project: Project) => {
          const payments = project.payments;
          if (!payments || !Array.isArray(payments) || payments.length === 0) {
            return <span className="text-gray-400">-</span>;
          }
          const lastPayment = payments[payments.length - 1];
          const formatted = formatCurrency(lastPayment);
          if (formatted === "-") {
            return <span className="text-gray-400">-</span>;
          }
          return <span>{formatted}</span>;
        },
        sortable: true,
        sortValue: (project: Project) => {
          const payments = project.payments;
          if (!payments || !Array.isArray(payments) || payments.length === 0) return 0;
          const lastPayment = payments[payments.length - 1];
          return typeof lastPayment === "number" ? lastPayment : parseFloat(String(lastPayment)) || 0;
        },
      },
      {
        key: "quickbooks",
        header: "QuickBooks",
        className: "w-[120px]",
        render: (project: Project) => {
          return <StatusBadge status={project.quickbooks ?? false} />;
        },
        sortable: true,
        sortValue: (project: Project) => project.quickbooks ? "Yes" : "No",
      },
    ];
  }, [onOpenNotesModal]);
}



