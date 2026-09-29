"use client";

import { useMemo } from "react";
import { SkeletonTable, type SkeletonTableColumn } from "@/components/shared";
import { useLeadsTableColumns } from "../hooks";

/** Columns the real table renders as a pill rather than a line of text. */
const BADGE_KEYS = new Set(["projectType", "status"]);

/**
 * Built from the real column definitions, so the headers and widths cannot
 * drift. What it was missing is the furniture around them: LeadsTable renders a
 * selection checkbox and a row-actions cell (40px each) and floors the table at
 * minWidth 1280, none of which the skeleton reserved — the 1200px of columns it
 * drew were 120px short of the table that replaced them.
 */
export function LeadsTableSkeleton() {
  const columns = useLeadsTableColumns({
    onOpenContactModal: () => {},
    onOpenNotesModal: () => {},
  });

  const skeletonColumns = useMemo<SkeletonTableColumn[]>(
    () =>
      columns.map((column) => {
        const key = String(column.key);
        if (key === "notes") return { header: column.header, className: column.className, variant: "icon" };
        if (BADGE_KEYS.has(key))
          return { header: column.header, className: column.className, variant: "badge" };
        if (column.className?.includes("text-right"))
          return { header: column.header, className: column.className, variant: "number" };
        return { header: column.header, className: column.className, variant: "text", cellWidth: "w-3/4" };
      }),
    [columns],
  );

  return (
    <SkeletonTable
      columns={skeletonColumns}
      rows={13}
      minWidth={1280}
      hasSelection
      hasRowActions
    />
  );
}
