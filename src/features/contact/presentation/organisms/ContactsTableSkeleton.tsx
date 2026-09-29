"use client";

import { SkeletonTable, type SkeletonTableColumn } from "@/components/shared";

/**
 * Mirrors useContactsTableColumns. The widths had drifted: Company was drawn at
 * 180px against the table's 140px and Client at 80px against 100px, so every
 * column to the right of Company sat 40px off and the whole row settled again
 * when the data arrived. The flag columns are right-aligned, not centred, and
 * the 40px row-actions column ContactsTable renders was missing.
 */
const COLUMNS: SkeletonTableColumn[] = [
  { header: "Notes", className: "w-[80px] text-center", variant: "icon" },
  { header: "Name", className: "w-[180px]", variant: "text", cellWidth: "w-3/4" },
  { header: "Company", className: "w-[140px]", variant: "text", cellWidth: "w-4/5" },
  { header: "Phone", className: "w-[180px]", variant: "text", cellWidth: "w-24" },
  { header: "Email", className: "w-[200px]", variant: "text", cellWidth: "w-3/4" },
  { header: "Customer", className: "w-[100px] text-right", variant: "number", cellWidth: "w-12" },
  { header: "Client", className: "w-[100px] text-right", variant: "number", cellWidth: "w-12" },
];

export function ContactsTableSkeleton() {
  return <SkeletonTable columns={COLUMNS} rows={13} hasRowActions />;
}
