"use client";

import { useMemo } from "react";
import { SkeletonCardList, SkeletonTable, type SkeletonTableColumn } from "@/components/shared";
import { useProjectsTableColumns } from "../hooks/table/useProjectsTableColumns";

/** Columns whose cell is a MoneyLine rail rather than a line of text. */
const MONEY_KEYS = new Set(["payments", "contractVsCash", "profitVsBacklog", "cashProfit", "backlog"]);

/**
 * Stand-in for ProjectsTable while the QuickBooks figures load — 8 to 30 seconds
 * on this screen, so it is what the user looks at most of the time.
 *
 * It reads the real column definitions rather than restating them. The hand-kept
 * copy had rotted into the pre-redesign table — Invoice Status, Invoice Amount,
 * Last Payment and QuickBooks, 7 columns totalling 1055px against the 10 cells
 * and 1490px the table actually renders — so the page re-laid itself the moment
 * the rows arrived. Reading the hook also keeps the Payments column behind
 * `finance:read` exactly as the table has it, and means the next column change
 * lands here for free.
 */
export function ProjectsTableSkeleton() {
  const columns = useProjectsTableColumns();

  const skeletonColumns = useMemo<SkeletonTableColumn[]>(
    () =>
      columns.map((column) => {
        const key = String(column.key);
        if (key === "notes")
          return { header: column.header, className: column.className, variant: "icon" };
        if (key === "projectProgressStatus")
          return { header: column.header, className: column.className, variant: "badge" };
        if (MONEY_KEYS.has(key))
          return { header: column.header, className: column.className, variant: "money" };
        return {
          header: column.header,
          className: column.className,
          variant: "text",
          cellWidth: "w-3/4",
        };
      }),
    [columns],
  );

  // ProjectsTable's own arithmetic: the column widths, plus 40px for the
  // checkbox column and 40px for the row-actions cell.
  const hasPayments = columns.some((column) => column.key === "payments");
  const minWidth = (hasPayments ? 1410 : 1240) + 40 + 40;

  return (
    <>
      <SkeletonCardList className="xl:hidden" count={5} />
      <SkeletonTable
        className="hidden xl:block"
        columns={skeletonColumns}
        rows={13}
        minWidth={minWidth}
        // ProjectsTable's DENSE_ROW_CLASS: 44px rows, not EntityTable's default 64.
        dense
        hasSelection
        hasRowActions
      />
    </>
  );
}
