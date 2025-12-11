"use client";

import * as React from "react";
import type { Company } from "../../domain/models";
import { ContextMenuTable, type ContextMenuTableItem } from "@dav033/dav-components";
import { useCompaniesTableColumns } from "../hooks";

export interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  services?: Array<{ id: number; name: string; color?: string | null }>;
  getContextMenuItems: (row: Company) => ContextMenuTableItem[];
  onOpenNotesModal?: (company: Company) => void;
}

export function CompaniesTable({
  companies,
  isLoading,
  services = [],
  getContextMenuItems,
  onOpenNotesModal,
}: CompaniesTableProps) {
  const columns = useCompaniesTableColumns({
    services,
    onOpenNotesModal: onOpenNotesModal || (() => {}),
  });

  return (
    <ContextMenuTable<Company>
      data={companies}
      columns={columns}
      rowKey={(company) => company.id ?? 0}
      getContextMenuItems={getContextMenuItems}
      isLoading={isLoading}
      emptyState={{
        iconName: "lucide:building",
        title: "No companies found.",
        subtitle: "Use the button above to create a new company.",
      }}
    />
  );
}
