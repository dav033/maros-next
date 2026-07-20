"use client";

import { memo, type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, ChevronsUpDown, Loader, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
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

/** Item del menú contextual de una fila de la tabla. */
export type EntityContextMenuItem = {
  /** Texto visible del item. */
  label: string;
  /** Acción al hacer clic. No es necesario si el item tiene `subItems`. */
  onClick?: () => void;
  /** Icono (nombre string lucide/mdi o ReactNode). */
  icon?: string | ReactNode;
  /** Variante visual: `"danger"` pinta el texto en rojo. */
  variant?: "default" | "danger";
  /** Deshabilitado (no se puede hacer clic). */
  disabled?: boolean;
  /** Muestra un checkmark al final del item. */
  checked?: boolean;
  /** Renderiza un separador horizontal en lugar del item. */
  separator?: boolean;
  /** Subítems anidados para menú en cascada. */
  subItems?: EntityContextMenuItem[];
};

export type EntityTableGroupBy<T> = {
  getKey: (row: T) => string;
  getLabel: (key: string) => string;
  getColor?: (key: string) => string | undefined;
  order?: string[];
};

/** Selección múltiple de filas para acciones en lote (bulk change status, bulk delete, ...). */
export type EntityTableSelection = {
  selectedIds: Set<string | number>;
  onSelectionChange: (ids: Set<string | number>) => void;
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

  /** Habilita checkboxes por fila + "select all" en el header. Opcional, no rompe consumidores existentes. */
  selection?: EntityTableSelection;

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
  selection,
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

  const visibleRows = isGrouped ? sortedData : pagedData;

  const allVisibleSelected =
    Boolean(selection) &&
    visibleRows.length > 0 &&
    visibleRows.every((row) => selection!.selectedIds.has(rowKey(row)));
  const someVisibleSelected =
    Boolean(selection) && visibleRows.some((row) => selection!.selectedIds.has(rowKey(row)));

  const handleToggleAll = useCallback(() => {
    if (!selection) return;
    const next = new Set(selection.selectedIds);
    if (allVisibleSelected) {
      for (const row of visibleRows) next.delete(rowKey(row));
    } else {
      for (const row of visibleRows) next.add(rowKey(row));
    }
    selection.onSelectionChange(next);
  }, [selection, allVisibleSelected, visibleRows, rowKey]);

  const handleToggleRow = useCallback(
    (row: T) => {
      if (!selection) return;
      const id = rowKey(row);
      const next = new Set(selection.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      selection.onSelectionChange(next);
    },
    [selection, rowKey],
  );

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

  const handleRowKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTableRowElement>, row: T) => {
      if (!onRowClick) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target as HTMLElement;
      if (target.closest('button, a, [role="button"], [role="menuitem"]')) return;
      event.preventDefault();
      onRowClick(row);
    },
    [onRowClick],
  );

  const menuItems = useMemo(() => {
    if (!contextSelected || !getContextMenuItems) return [];
    return getContextMenuItems(contextSelected);
  }, [contextSelected, getContextMenuItems]);

  const renderMenuItem = (item: EntityContextMenuItem, index: number): ReactNode => {
    if (item.separator) {
      return <DropdownMenuSeparator key={`separator-${index}`} />;
    }

    if (item.subItems && item.subItems.length > 0) {
      return (
        <DropdownMenuSub key={`${item.label}-${index}`}>
          <DropdownMenuSubTrigger
            disabled={item.disabled}
            className={cn(
              "flex items-center gap-2",
              item.variant === "danger" &&
                "text-destructive focus:text-destructive focus:bg-destructive/10",
            )}
          >
            {item.icon && <span className="mr-2">{resolveContextIcon(item.icon)}</span>}
            <span>{item.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {item.subItems.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }

    return (
      <DropdownMenuItem
        key={`${item.label}-${index}`}
        disabled={item.disabled}
        onClick={() => {
          if (item.disabled || !item.onClick) return;
          item.onClick();
          setContextMenuOpen(false);
        }}
        className={cn(
          "flex items-center gap-2",
          item.variant === "danger" &&
            "text-destructive focus:text-destructive focus:bg-destructive/10",
        )}
      >
        {item.icon && <span className="mr-2">{resolveContextIcon(item.icon)}</span>}
        <span className="flex-1">{item.label}</span>
        {item.checked && <Check className="h-4 w-4 ml-auto" />}
      </DropdownMenuItem>
    );
  };

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
    const rowMenuItems = getContextMenuItems ? getContextMenuItems(row) : [];
    return (
      <TableRow
        key={rowKey(row)}
        data-mutating={mutating || undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onContextMenu={
          getContextMenuItems ? (event) => handleRowContextMenu(event, row) : undefined
        }
        onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
        onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
        onMouseEnter={getRowHref ? () => handleRowMouseEnter(row) : undefined}
        className={cn(
          "transition-colors",
          mutating && "opacity-60 pointer-events-none",
          onRowClick &&
            "cursor-pointer hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
        )}
      >
        {selection ? (
          <TableCell className="w-10 px-4 py-3">
            <Checkbox
              checked={selection.selectedIds.has(rowKey(row))}
              onCheckedChange={() => handleToggleRow(row)}
              onClick={(event) => event.stopPropagation()}
              aria-label="Select row"
            />
          </TableCell>
        ) : null}
        {columns.map((col) => (
          <TableCell key={String(col.key)} className={cn("px-4 py-3", col.className)}>
            {col.render
              ? col.render(row)
              : ((row as Record<string, unknown>)[col.key as string] as ReactNode) ??
                null}
          </TableCell>
        ))}
        {getContextMenuItems ? (
          <TableCell className="w-10 px-2 py-3 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Row actions"
                  className="h-8 w-8"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {rowMenuItems.map((item, index) => renderMenuItem(item, index))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        ) : null}
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
              {selection ? (
                <TableHead className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                    onCheckedChange={handleToggleAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              ) : null}
              {columns.map((col) => {
                const key = String(col.key);
                const isActive = sortKey === key;
                const ariaSort = col.sortable
                  ? isActive
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                  : undefined;
                return (
                  <TableHead
                    key={key}
                    className={cn(
                      "px-4 py-3 h-full align-middle",
                      col.className,
                      col.sortable &&
                        "cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                    )}
                    tabIndex={col.sortable ? 0 : undefined}
                    aria-sort={ariaSort}
                    onClick={col.sortable ? () => handleSort(col) : undefined}
                    onKeyDown={
                      col.sortable
                        ? (event) => {
                            if (event.key !== "Enter" && event.key !== " ") return;
                            event.preventDefault();
                            handleSort(col);
                          }
                        : undefined
                    }
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
              {getContextMenuItems ? (
                <TableHead className="w-10 px-2 py-3">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {showSkeleton
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {selection ? (
                      <TableCell className="w-10 px-4 py-3">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                      </TableCell>
                    ) : null}
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                    {getContextMenuItems ? (
                      <TableCell className="w-10 px-2 py-3">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              : isGrouped
                ? groups.map((group) => (
                    <GroupRows
                      key={group.key}
                      group={group}
                      columnsCount={
                        columns.length + (getContextMenuItems ? 1 : 0) + (selection ? 1 : 0)
                      }
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
          {menuItems.map((item, index) => renderMenuItem(item, index))}
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
