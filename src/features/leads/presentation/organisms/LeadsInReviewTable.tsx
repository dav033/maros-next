"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import {
  DefaultTableLoading,
  EntityTable,
  type EntityContextMenuItem,
} from "@/components/shared";
import type { Lead } from "@/leads/domain";

import { useLeadsInReviewTableColumns } from "../hooks";

export interface LeadsInReviewTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onEdit?: (lead: Lead) => void;
  getContextMenuItems: (row: Lead) => EntityContextMenuItem[];
  onOpenNotesModal?: (lead: Lead) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewContact?: (contact: any) => void;
  onAccept: (lead: Lead) => void;
  onReject: (lead: Lead) => void;
  isAccepting?: number | null;
  isRejecting?: number | null;
  pagination?: { enabled?: boolean };
  isMutating?: (lead: Lead) => boolean;
}

export function LeadsInReviewTable({
  leads,
  isLoading,
  getContextMenuItems,
  onOpenNotesModal,
  onViewContact,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  pagination,
  isMutating,
}: LeadsInReviewTableProps) {
  const router = useRouter();
  const columns = useLeadsInReviewTableColumns({
    onOpenContactModal: onViewContact ?? (() => {}),
    onOpenNotesModal: onOpenNotesModal ?? (() => {}),
    onAccept,
    onReject,
    isAccepting,
    isRejecting,
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
      getContextMenuItems={contextMenu}
      onRowClick={(l) => l.id && router.push(`/lead/${l.id}`)}
      getRowHref={(l) => (l.id ? `/lead/${l.id}` : undefined)}
      paginated={pagination?.enabled}
      loadingState={<DefaultTableLoading label="Loading leads…" />}
      emptyState={
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
          <ClipboardCheck className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No leads in review.</h3>
          <p className="text-sm text-muted-foreground mt-1">
            All leads have been processed.
          </p>
        </div>
      }
    />
  );
}
