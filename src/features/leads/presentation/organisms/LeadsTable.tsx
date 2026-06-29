"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import {
  DefaultTableLoading,
  EntityTable,
  type EntityContextMenuItem,
  type EntityTableGroupBy,
} from "@/components/shared";
import type { Lead } from "@/leads/domain";
import { LeadType, getLeadTypeFromNumber } from "@/leads/domain";

import { useLeadsTableColumns } from "../hooks";
import type { LeadGroupBy } from "../hooks/table/useLeadsTableLogic";

const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  [LeadType.CONSTRUCTION]: "Construction",
  [LeadType.ROOFING]: "Roofing",
  [LeadType.PLUMBING]: "Plumbing",
  [LeadType.FENCE]: "Fence",
};

const LEAD_TYPE_COLORS: Record<LeadType, string> = {
  [LeadType.CONSTRUCTION]: "#f59e0b",
  [LeadType.ROOFING]: "#ef4444",
  [LeadType.PLUMBING]: "#3b82f6",
  [LeadType.FENCE]: "#10b981",
};

const LEAD_TYPE_ORDER = [
  LeadType.CONSTRUCTION,
  LeadType.ROOFING,
  LeadType.PLUMBING,
  LeadType.FENCE,
];

const STATUS_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  ESTIMATING_PREPARING_PROPOSAL: "Estimating / Preparing Proposal",
  PROPOSAL_SENT: "Proposal Sent",
  FOLLOW_UP: "Follow Up",
  WON: "Won",
  LOST: "Lost",
};

const STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "#6b7280",
  CONTACTED: "#3b82f6",
  ESTIMATING_PREPARING_PROPOSAL: "#6366f1",
  PROPOSAL_SENT: "#f59e0b",
  FOLLOW_UP: "#f97316",
  WON: "#22c55e",
  LOST: "#6b7280",
};

const STATUS_ORDER = [
  "NEW_LEAD",
  "CONTACTED",
  "ESTIMATING_PREPARING_PROPOSAL",
  "PROPOSAL_SENT",
  "FOLLOW_UP",
  "WON",
  "LOST",
];

function buildGroupBy(mode: LeadGroupBy): EntityTableGroupBy<Lead> | undefined {
  if (mode === "none") return undefined;
  if (mode === "status") {
    return {
      getKey: (l) => l.status,
      getLabel: (key) => STATUS_LABELS[key] ?? key,
      getColor: (key) => STATUS_COLORS[key],
      order: STATUS_ORDER,
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

type ContextMenuItem = {
  label: string;
  onClick: () => void;
  icon?: string | React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
};

export interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onEdit?: (lead: Lead) => void;
  getContextMenuItems: (row: Lead) => ContextMenuItem[];
  onOpenNotesModal?: (lead: Lead) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewContact?: (contact: any) => void;
  groupBy?: LeadGroupBy;
  pagination?: { enabled?: boolean };
}

export function LeadsTable({
  leads,
  isLoading,
  getContextMenuItems,
  onOpenNotesModal,
  onViewContact,
  groupBy = "none",
  pagination,
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
      })),
    [getContextMenuItems],
  );

  return (
    <EntityTable<Lead>
      data={leads}
      columns={columns}
      rowKey={(l) => (l.id as number) ?? 0}
      isLoading={isLoading}
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
