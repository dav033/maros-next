"use client";

import { SkeletonTable, type SkeletonTableColumn } from "@/components/shared";

/**
 * Mirrors useCompaniesTableColumns. Three fixes against the real table:
 * it drew a "Status" column that no longer exists (8 columns / 1100px against
 * the table's 7 / 1000px), it called the last column "Client" where the table
 * says "Supplier", and it centred the two flag columns the table right-aligns.
 * It also left out the 40px row-actions column CompaniesTable renders.
 */
const COLUMNS: SkeletonTableColumn[] = [
  { header: "Notes", className: "w-[80px] text-center", variant: "icon" },
  { header: "Name", className: "w-[200px]", variant: "text", cellWidth: "w-3/4" },
  { header: "Address", className: "w-[250px]", variant: "text", cellWidth: "w-4/5" },
  { header: "Type", className: "w-[120px]", variant: "badge", cellWidth: "w-20" },
  { header: "Service", className: "w-[150px]", variant: "badge" },
  { header: "Customer", className: "w-[100px] text-right", variant: "number", cellWidth: "w-12" },
  { header: "Supplier", className: "w-[100px] text-right", variant: "number", cellWidth: "w-12" },
];

export function CompaniesTableSkeleton() {
  return <SkeletonTable columns={COLUMNS} rows={13} hasRowActions />;
}
