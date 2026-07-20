"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import {
  DefaultTableLoading,
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
  getContextMenuItems: (row: Lead) => EntityContextMenuItem[];
  onOpenNotesModal?: (lead: Lead) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewContact?: (contact: any) => void;
  groupBy?: LeadGroupBy;
  pagination?: { enabled?: boolean };
  isMutating?: (lead: Lead) => boolean;
  selection?: EntityTableSelection;
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
}: LeadsTableProps) {
  const router = useRouter();
  const columns = useLeadsTableColumns({
    onOpenContactModal: onViewContact ?? (() => {}),
    onOpenNotesModal: onOpenNotesModal ?? (() => {}),
  });

  const contextMenu = useMemo<(row: Lead) => EntityContextMenuItem[]>(
    () => (row: Lead) =>
      getContextMenuItems(row).map((item) => ({
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
      getContextMenuItems={contextMenu}
      onRowClick={(l) => l.id && router.push(`/lead/${l.id}`)}
      getRowHref={(l) => (l.id ? `/lead/${l.id}` : undefined)}
      groupBy={buildGroupBy(groupBy)}
      paginated={pagination?.enabled}
      defaultSort={{ key: "leadNumber", dir: "desc" }}
      loadingState={<DefaultTableLoading label="Loading leads…" />}
      emptyState={
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
          <FileText className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No leads found.</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Use the button above to create a new lead.
          </p>
        </div>
      }
    />
  );
}
