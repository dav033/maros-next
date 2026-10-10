"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import {
  EntityTable,
  type EntityContextMenuItem,
  type EntityTableGroupBy,
  type EntityTableSelection,
} from "@/components/shared";
import type { Lead, LeadType } from "@/leads/domain";
import { DEFAULT_STATUS_ORDER, STATUS_LABELS, getLeadTypeFromNumber } from "@/leads/domain";

import { useLeadsTableColumns } from "../hooks";
import type { LeadGroupBy } from "../hooks/table/useLeadsTableLogic";
import { LEAD_STATUS_COLORS, LEAD_TYPE_COLORS, LEAD_TYPE_LABELS, LEAD_TYPE_ORDER } from "../atoms/leadVisualTokens";

function buildGroupBy(mode: LeadGroupBy): EntityTableGroupBy<Lead> | undefined {
  if (mode === "none") return undefined;
  if (mode === "status") {
    return {
      getKey: (l) => l.status,
      getLabel: (key) => (STATUS_LABELS as Record<string, string>)[key] ?? key,
      getColor: (key) => LEAD_STATUS_COLORS[key],
      order: [...DEFAULT_STATUS_ORDER],
    };
  }
  if (mode === "leadType") {
    return {
      getKey: (l) => getLeadTypeFromNumber(l.leadNumber) ?? "Unclassified",
      getLabel: (key) => LEAD_TYPE_LABELS[key as LeadType] ?? key,
      getColor: (key) => LEAD_TYPE_COLORS[key as LeadType],
      order: LEAD_TYPE_ORDER,
    };
  }
  return {
    getKey: (l) => l.projectType?.name ?? "Unclassified",
    getLabel: (key) => key,
  };
}

export interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onEdit?: (lead: Lead) => void;
  getContextMenuItems?: (row: Lead) => EntityContextMenuItem[];
  onOpenNotesModal?: (lead: Lead) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewContact?: (contact: any) => void;
  groupBy?: LeadGroupBy;
  pagination?: { enabled?: boolean };
  isMutating?: (lead: Lead) => boolean;
  selection?: EntityTableSelection;
  readOnly?: boolean;
}

export function LeadsTable({
  leads,
  isLoading,
  getContextMenuItems,
  onOpenNotesModal,
  onViewContact,
  groupBy = "none",
  pagination,
  isMutating,
  selection,
  readOnly = false,
}: LeadsTableProps) {
  const router = useRouter();
  const columns = useLeadsTableColumns({
    onOpenContactModal: onViewContact ?? (() => {}),
    onOpenNotesModal: onOpenNotesModal ?? (() => {}),
    readOnly,
  });

  const contextMenu = useMemo<(row: Lead) => EntityContextMenuItem[]>(
    () => (row: Lead) =>
      (getContextMenuItems?.(row) ?? []).map((item) => ({
        label: item.label,
        onClick: item.onClick,
        icon: item.icon,
        variant: item.variant,
        disabled: item.disabled,
        checked: item.checked,
        separator: item.separator,
        subItems: item.subItems,
      })),
    [getContextMenuItems],
  );

  return (
    <EntityTable<Lead>
      data={leads}
      columns={columns}
      rowKey={(l) => (l.id as number) ?? 0}
      isLoading={isLoading}
      isMutating={isMutating}
      selection={selection}
      getContextMenuItems={readOnly ? undefined : contextMenu}
      onRowClick={(l) => {
        if (readOnly && l.project?.id) router.push(`/project/${l.project.id}`);
        else if (!readOnly && l.id) router.push(`/lead/${l.id}`);
      }}
      getRowHref={(l) => readOnly
        ? (l.project?.id ? `/project/${l.project.id}` : undefined)
        : (l.id ? `/lead/${l.id}` : undefined)}
      groupBy={buildGroupBy(groupBy)}
      // Roughly the sum of the column widths in useLeadsTableColumns, plus the
      // checkbox and actions cells. Below this the table scrolls sideways rather
      // than crushing the columns — see EntityTable's minWidth.
      minWidth={1280}
      paginated={pagination?.enabled}
      defaultSort={{ key: "leadNumber", dir: "desc" }}
      emptyState={
        <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-elev-2 p-8 text-center">
          <FileText className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-lg font-medium text-foreground">
            {readOnly ? "No converted leads found." : "No leads found."}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {readOnly
              ? "No project-linked leads match this type."
              : "Use the button above to create a new lead."}
          </p>
        </div>
      }
    />
  );
}
