"use client";

import * as React from "react";
import type { Lead } from "@/leads/domain";
import {
  ContextMenuTable,
  type ContextMenuTableItem,
} from "@dav033/dav-components";
import { useLeadsTableColumns } from "../hooks";

export interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onEdit?: (lead: Lead) => void;
  getContextMenuItems: (row: Lead) => ContextMenuTableItem[];
  onOpenNotesModal?: (lead: Lead) => void;
  onViewContact?: (contact: any) => void;
}

export function LeadsTable({
  leads,
  isLoading,
  onEdit,
  getContextMenuItems,
  onOpenNotesModal,
  onViewContact,
}: LeadsTableProps) {
  const columns = useLeadsTableColumns({
    onOpenContactModal: onViewContact ?? (() => {}),
    onOpenNotesModal: onOpenNotesModal ?? (() => {}),
  });

  return (
    <ContextMenuTable<Lead>
      data={leads}
      columns={columns}
      rowKey={(lead) => (lead.id as number) ?? 0}
      getContextMenuItems={getContextMenuItems}
      isLoading={isLoading}
      emptyState={{
        iconName: "lucide:file-text",
        title: "No leads found.",
        subtitle: "Use the button above to create a new lead.",
      }}
    />
  );
}
