"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building } from "lucide-react";

import {
  DefaultTableLoading,
  EntityTable,
  type EntityContextMenuItem,
  type EntityTableGroupBy,
} from "@/components/shared";

import type { Company } from "../../domain/models";
import { useCompaniesTableColumns } from "../hooks";
import type { CompanyGroupBy } from "../hooks/table/useCompaniesTableLogic";

const TYPE_LABELS: Record<string, string> = {
  DESIGN: "Design",
  HOA: "HOA",
  GENERAL_CONTRACTOR: "Contractor",
  SUPPLIER: "Supplier",
  SUBCONTRACTOR: "Subcontractor",
  OTHER: "Other",
};

function buildGroupBy(mode: CompanyGroupBy): EntityTableGroupBy<Company> | undefined {
  if (mode === "none") return undefined;
  if (mode === "type") {
    return {
      getKey: (c) => c.type ?? "OTHER",
      getLabel: (key) => TYPE_LABELS[key] ?? key,
    };
  }
  if (mode === "customer") {
    return {
      getKey: (c) => (c.isCustomer ? "Yes" : "No"),
      getLabel: (key) => key,
    };
  }
  return {
    getKey: (c) => (c.isClient ? "Yes" : "No"),
    getLabel: (key) => key,
  };
}

export interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  services?: Array<{ id: number; name: string; color?: string | null }>;
  getContextMenuItems: (row: Company) => Array<{
    label: string;
    onClick: () => void;
    icon?: string | React.ReactNode;
    variant?: "default" | "danger";
    disabled?: boolean;
  }>;
  onOpenNotesModal?: (company: Company) => void;
  groupBy?: CompanyGroupBy;
  pagination?: { enabled?: boolean };
}

export function CompaniesTable({
  companies,
  isLoading,
  services = [],
  getContextMenuItems,
  onOpenNotesModal,
  groupBy = "none",
  pagination,
}: CompaniesTableProps) {
  const router = useRouter();
  const columns = useCompaniesTableColumns({
    services,
    onOpenNotesModal: onOpenNotesModal || (() => {}),
  });

  const contextMenu = useMemo<(row: Company) => EntityContextMenuItem[]>(
    () => (row: Company) =>
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
    <EntityTable<Company>
      data={companies}
      columns={columns}
      rowKey={(c) => c.id ?? 0}
      isLoading={isLoading}
      getContextMenuItems={contextMenu}
      onRowClick={(c) => c.id && router.push(`/company/${c.id}`)}
      getRowHref={(c) => (c.id ? `/company/${c.id}` : undefined)}
      groupBy={buildGroupBy(groupBy)}
      paginated={pagination?.enabled}
      defaultSort={{ key: "name", dir: "asc" }}
      loadingState={<DefaultTableLoading label="Loading companies…" />}
      emptyState={
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
          <Building className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No companies found.</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Use the button above to create a new company.
          </p>
        </div>
      }
    />
  );
}
