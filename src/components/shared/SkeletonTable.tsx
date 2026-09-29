"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * The table skeleton used by the route-level loading states (`loading.tsx`,
 * Suspense fallbacks), where the real columns are not available yet because the
 * data — and with it the component that declares them — has not loaded.
 *
 * It deliberately reproduces EntityTable's shell byte for byte: the same
 * `rounded-2xl bg-elev-2 shadow-sm overflow-x-auto` section, the same
 * `bg-elev-3` header at h-12 with uppercase tracking, the same cell padding and
 * the same `minWidth` floor. A skeleton that does not match is what produces the
 * jump when the data lands, so every number here has a counterpart in the table
 * it stands in for and must be kept in step with it.
 */
export type SkeletonTableColumn = {
  /** Header label. Rendered for real — it is known before the data is. */
  header: string;
  /** Same width class the real column carries, e.g. `w-[150px]`. */
  className?: string;
  /**
   * Shape of the placeholder in the body cells, matched to what the real cell
   * draws: a line of text, a pill badge, a right-aligned figure, a money bar,
   * or a round icon button.
   */
  variant?: "text" | "badge" | "money" | "number" | "icon";
  /** Width class of the placeholder inside the cell. Defaults per variant. */
  cellWidth?: string;
};

const DEFAULT_CELL_WIDTH: Record<NonNullable<SkeletonTableColumn["variant"]>, string> = {
  text: "w-full",
  badge: "w-24",
  money: "w-full",
  number: "w-20",
  icon: "w-8",
};

function SkeletonCell({ column }: { column: SkeletonTableColumn }) {
  const variant = column.variant ?? "text";
  const width = column.cellWidth ?? DEFAULT_CELL_WIDTH[variant];

  switch (variant) {
    case "badge":
      return <Skeleton className={cn("h-6 rounded-full", width)} />;
    case "number":
      return <Skeleton className={cn("ml-auto h-4", width)} />;
    case "icon":
      return <Skeleton className={cn("mx-auto h-8 rounded-md", width)} />;
    case "money":
      // MoneyLine draws a 32px rail with a caption under it.
      return (
        <div className="space-y-1">
          <Skeleton className={cn("h-3", width)} />
          <Skeleton className="h-2 w-2/3" />
        </div>
      );
    default:
      return <Skeleton className={cn("h-4", width)} />;
  }
}

export function SkeletonTable({
  columns,
  rows = 10,
  minWidth,
  /** `true` for the 44px rows EntityTable's DENSE_ROW_CLASS produces. */
  dense = false,
  hasSelection = false,
  hasRowActions = false,
  className,
}: {
  columns: SkeletonTableColumn[];
  rows?: number;
  minWidth?: number;
  dense?: boolean;
  hasSelection?: boolean;
  hasRowActions?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "skeleton-deferred overflow-x-auto rounded-2xl bg-elev-2 shadow-sm",
        className,
      )}
      aria-busy="true"
    >
      <Table style={minWidth ? { minWidth } : undefined}>
        <TableHeader className="bg-elev-3">
          <TableRow className="h-12 border-b border-line text-left font-display text-xs uppercase tracking-wide text-muted-foreground">
            {hasSelection ? (
              <TableHead className="w-10 px-4 py-3">
                <Skeleton className="h-4 w-4 rounded-sm" />
              </TableHead>
            ) : null}
            {columns.map((column) => (
              <TableHead
                key={column.header}
                className={cn("h-full px-4 py-3 align-middle", column.className)}
              >
                <span className="whitespace-nowrap">{column.header}</span>
              </TableHead>
            ))}
            {hasRowActions ? <TableHead className="w-10 px-2 py-3" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className={dense ? "h-11" : undefined}>
              {hasSelection ? (
                <TableCell className={cn("w-10 px-4", dense ? "py-1" : "py-3")}>
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </TableCell>
              ) : null}
              {columns.map((column) => (
                <TableCell
                  key={column.header}
                  className={cn("px-4", dense ? "py-1" : "py-3", column.className)}
                >
                  <SkeletonCell column={column} />
                </TableCell>
              ))}
              {hasRowActions ? (
                <TableCell className={cn("w-10 px-2", dense ? "py-1" : "py-3")}>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

/**
 * The card stack EntityTable renders below `xl` in place of the table, so a
 * narrow screen gets a skeleton of the same shape instead of an empty page.
 */
export function SkeletonCardList({
  count = 5,
  lines = 3,
  className,
}: {
  count?: number;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("skeleton-deferred space-y-3", className)} aria-busy="true">
      {Array.from({ length: count }).map((_, cardIndex) => (
        <article
          key={cardIndex}
          className="space-y-2 rounded-xl border border-line bg-elev-2 p-4 shadow-sm"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-3/4" />
          {Array.from({ length: Math.max(lines - 2, 0) }).map((__, lineIndex) => (
            <Skeleton key={lineIndex} className="h-3 w-1/2" />
          ))}
        </article>
      ))}
    </div>
  );
}

/**
 * A shadcn <Card> placeholder: `rounded-xl border bg-card shadow`, header `p-6`,
 * content `p-6 pt-0` — the same box the detail pages build their columns from,
 * so the panels do not resize when the real cards replace them.
 */
export function SkeletonCard({
  bodyHeight = "h-40",
  withAction = true,
  className,
}: {
  bodyHeight?: string;
  withAction?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-line bg-card shadow", className)}>
      <div className="flex flex-row items-center justify-between gap-3 p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </div>
        {withAction ? <Skeleton className="h-8 w-20 rounded-md" /> : null}
      </div>
      <div className="p-6 pt-0">
        <Skeleton className={cn("w-full", bodyHeight)} />
      </div>
    </div>
  );
}

/**
 * The `EntityDetailHeader` placeholder: back button, 3xl title, optional
 * subtitle, actions pinned right.
 */
export function SkeletonDetailHeader({ withSubtitle = true }: { withSubtitle?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="size-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          {withSubtitle ? <Skeleton className="h-5 w-48" /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}
