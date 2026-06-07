"use client";

import { memo, type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination, type PageSizeOption } from "@/common/hooks/table/usePagination";
import { sortRows, type SortDir } from "@/common/hooks/table/sorting";
import { cn } from "@/lib/utils";
import type { SimpleTableColumn } from "@/types/table";

import { TablePagination } from "./TablePagination";
import { resolveContextIcon } from "./contextMenuIcons";

export type EntityContextMenuItem = {
  label: string;
  onClick: () => void;
  icon?: string | ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
};

export type EntityTableGroupBy<T> = {
  getKey: (row: T) => string;
  getLabel: (key: string) => string;
  getColor?: (key: string) => string | undefined;
  order?: string[];
};

export type EntityTableProps<T> = {
  data: T[];
  columns: SimpleTableColumn<T>[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  isMutating?: (row: T) => boolean;

  getContextMenuItems?: (row: T) => EntityContextMenuItem[];
  onRowClick?: (row: T) => void;
  /** Returns a route to prefetch on row hover (warms Next.js bundle for instant navigation). */
  getRowHref?: (row: T) => string | undefined;

  groupBy?: EntityTableGroupBy<T>;
  paginated?: boolean;
  defaultPageSize?: PageSizeOption;

  defaultSort?: { key: string; dir: SortDir };

  loadingState?: ReactNode;
  emptyState?: ReactNode;

  className?: string;
  skeletonRows?: number;
};

type Group<T> = {
  key: string;
  label: string;
  color?: string;
  items: T[];
};

function groupRows<T>(rows: T[], groupBy: EntityTableGroupBy<T> | undefined): Group<T>[] {
  if (!groupBy) return [{ key: "_all", label: "", items: rows }];

  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = groupBy.getKey(row);
    const existing = map.get(key) ?? [];
    existing.push(row);
    map.set(key, existing);
  }

  const entries = [...map.entries()];
  if (groupBy.order && groupBy.order.length > 0) {
    const order = groupBy.order;
    entries.sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  } else {
    entries.sort(([a], [b]) => a.localeCompare(b));
  }

  return entries.map(([key, items]) => ({
    key,
    label: groupBy.getLabel(key),
    color: groupBy.getColor?.(key),
    items,
  }));
}

function EntityTableInner<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  isMutating,
  getContextMenuItems,
  onRowClick,
  getRowHref,
  groupBy,
  paginated = false,
  defaultPageSize = 25,
  defaultSort,
  loadingState,
  emptyState,
  className,
  skeletonRows = 6,
}: EntityTableProps<T>) {
  const router = useRouter();
  const prefetchedRef = useRef<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort?.dir ?? "asc");

  const sortedData = useMemo(
    () => sortRows(data, columns, sortKey, sortDir),
    [data, columns, sortKey, sortDir],
  );

  const isGrouped = Boolean(groupBy);
  const groups = useMemo(
    () => (isGrouped ? groupRows(sortedData, groupBy) : []),
    [isGrouped, sortedData, groupBy],
  );

  const {
    pagedData,
    page,
    pageSize,
    totalPages,
    totalItems,
    isPaginated,
    setPage,
    setPageSize,
  } = usePagination({
    data: sortedData,
    enabled: !isGrouped && paginated,
    defaultPageSize,
  });

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextSelected, setContextSelected] = useState<T | null>(null);
  const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });

  const handleSort = useCallback(
    (col: SimpleTableColumn<T>) => {
      if (!col.sortable) return;
      const key = String(col.key);
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const handleRowContextMenu = useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, row: T) => {
      if (!getContextMenuItems) return;
      event.preventDefault();
      setContextSelected(row);
      setContextPosition({ x: event.clientX, y: event.clientY });
      setContextMenuOpen(true);
    },
    [getContextMenuItems],
  );

  const handleRowMouseEnter = useCallback(
    (row: T) => {
      if (!getRowHref) return;
      const href = getRowHref(row);
      if (!href || prefetchedRef.current.has(href)) return;
      prefetchedRef.current.add(href);
      router.prefetch(href);
    },
    [getRowHref, router],
  );

  const handleRowClick = useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, row: T) => {
      if (!onRowClick) return;
      if (event.button === 2) return;
      const target = event.target as HTMLElement;
      if (target.closest('button, a, [role="button"], [role="menuitem"]')) return;
      if (contextMenuOpen) return;
      onRowClick(row);
    },
    [onRowClick, contextMenuOpen],
  );

  const menuItems = useMemo(() => {
    if (!contextSelected || !getContextMenuItems) return [];
    return getContextMenuItems(contextSelected);
  }, [contextSelected, getContextMenuItems]);

  const showSkeleton = isLoading && data.length === 0;
  const showEmpty = !isLoading && data.length === 0;

  if (isLoading && data.length === 0 && loadingState) {
    return <div className={className}>{loadingState}</div>;
  }

  if (showEmpty && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  const renderRow = (row: T) => {
    const mutating = isMutating?.(row) ?? false;
    return (
      <TableRow
        key={rowKey(row)}
        data-mutating={mutating || undefined}
        onContextMenu={
          getContextMenuItems ? (event) => handleRowContextMenu(event, row) : undefined
        }
        onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
        onMouseEnter={getRowHref ? () => handleRowMouseEnter(row) : undefined}
        className={cn(
          "transition-colors",
          mutating && "opacity-60 pointer-events-none",
          onRowClick && "cursor-pointer hover:bg-accent/30",
        )}
      >
        {columns.map((col) => (
          <TableCell key={String(col.key)} className={cn("px-4 py-3", col.className)}>
            {col.render
              ? col.render(row)
              : ((row as Record<string, unknown>)[col.key as string] as ReactNode) ??
                null}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <>
      <section
        className={cn(
          "rounded-2xl bg-card shadow-sm overflow-x-auto",
          className,
        )}
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="text-left text-xs uppercase tracking-wide text-muted-foreground h-12 border-b border-border">
              {columns.map((col) => {
                const key = String(col.key);
                const isActive = sortKey === key;
                return (
                  <TableHead
                    key={key}
                    className={cn(
                      "px-4 py-3 h-full align-middle",
                      col.className,
                      col.sortable && "cursor-pointer select-none",
                    )}
                    onClick={col.sortable ? () => handleSort(col) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable &&
                        (isActive ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-foreground" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-foreground" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        ))}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {showSkeleton
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : isGrouped
                ? groups.map((group) => (
                    <GroupRows
                      key={group.key}
                      group={group}
                      columnsCount={columns.length}
                      renderRow={renderRow}
                    />
                  ))
                : pagedData.map(renderRow)}
          </TableBody>
        </Table>
      </section>

      {!isGrouped && isPaginated && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <DropdownMenuContent
          className="min-w-[160px]"
          style={{
            position: "fixed",
            left: contextPosition.x,
            top: contextPosition.y,
          }}
        >
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={`${item.label}-${index}`}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                item.onClick();
                setContextMenuOpen(false);
              }}
              className={cn(
                item.variant === "danger" &&
                  "text-destructive focus:text-destructive focus:bg-destructive/10",
              )}
            >
              {item.icon && <span className="mr-2">{resolveContextIcon(item.icon)}</span>}
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function GroupRowsInner<T>({
  group,
  columnsCount,
  renderRow,
}: {
  group: Group<T>;
  columnsCount: number;
  renderRow: (row: T) => ReactNode;
}) {
  return (
    <>
      <TableRow className="bg-muted/20 hover:bg-muted/20">
        <TableCell
          colSpan={columnsCount}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
          style={group.color ? { color: group.color } : undefined}
        >
          {group.label}
          <span className="ml-2 font-normal text-muted-foreground">
            ({group.items.length})
          </span>
        </TableCell>
      </TableRow>
      {group.items.map(renderRow)}
    </>
  );
}

const GroupRows = memo(GroupRowsInner) as typeof GroupRowsInner;

export const EntityTable = memo(EntityTableInner) as typeof EntityTableInner;

export function DefaultTableLoading({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
      <Loader className="size-12 text-muted-foreground/50 mb-4 animate-spin" />
      <h3 className="text-lg font-medium text-foreground">{label ?? "Loading…"}</h3>
    </div>
  );
}
