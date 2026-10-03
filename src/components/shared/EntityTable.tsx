"use client";

import {
  type ComponentType,
  memo,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, ChevronsUpDown, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
/**
 * Los dos menús de una fila —el del clic derecho y el del botón de tres
 * puntos— ofrecen los mismos ítems. Radix da un juego de piezas por primitivo,
 * con la misma forma, así que el renderizador recibe el juego en vez de
 * duplicarse: dos copias es como acaban diciendo cosas distintas.
 */
type MenuPartProps = {
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  collisionPadding?: number;
};

type MenuParts = {
  Item: ComponentType<MenuPartProps>;
  Separator: ComponentType<MenuPartProps>;
  Sub: ComponentType<MenuPartProps>;
  SubTrigger: ComponentType<MenuPartProps>;
  SubContent: ComponentType<MenuPartProps>;
};

/** El menú del botón de tres puntos. */
const DROPDOWN_PARTS: MenuParts = {
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};

/**
 * El menú del clic derecho. Antes era un DropdownMenu anclado a un `span`
 * invisible colocado a mano en las coordenadas del cursor, y salía lejos de
 * donde se había pulsado: un DropdownMenu de Radix es modal, así que mientras
 * estaba abierto su capa se comía el siguiente clic derecho y el menú se
 * reabría contra el ancla anterior. ContextMenu es el primitivo hecho para
 * esto: rastrea el punto del clic él mismo y gestiona los bordes de la pantalla.
 */
const CONTEXT_PARTS: MenuParts = {
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
};

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
  getRowClassName?: (row: T) => string | undefined;
  onRowClick?: (row: T) => void;
  /** Returns a route to prefetch on row hover (warms Next.js bundle for instant navigation). */
  getRowHref?: (row: T) => string | undefined;

  /** Habilita checkboxes por fila + "select all" en el header. Opcional, no rompe consumidores existentes. */
  selection?: EntityTableSelection;

  /**
   * Width in px below which the table scrolls sideways instead of compressing.
   * Without it the table is plain `w-full`, so on a narrow screen the browser
   * ignores the columns' declared widths and squeezes them until the content
   * wraps. Set it to roughly the sum of the column widths. The scroll lives on
   * the table's own container, so nothing above it (toolbar, header) moves.
   */
  minWidth?: number;

  groupBy?: EntityTableGroupBy<T>;
  paginated?: boolean;
  defaultPageSize?: PageSizeOption;

  defaultSort?: { key: string; dir: SortDir };

  loadingState?: ReactNode;
  emptyState?: ReactNode;
  mobileRender?: (row: T) => ReactNode;

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
  getRowClassName,
  onRowClick,
  getRowHref,
  selection,
  minWidth,
  groupBy,
  paginated = false,
  defaultPageSize = 25,
  defaultSort,
  loadingState,
  emptyState,
  mobileRender,
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
  const mobileSortableColumns = columns.filter((column) => column.sortable);

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
      onRowClick(row);
    },
    [onRowClick],
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

  const renderMenuItem = (
    item: EntityContextMenuItem,
    index: number,
    parts: MenuParts,
  ): ReactNode => {
    if (item.separator) {
      return <parts.Separator key={`separator-${index}`} />;
    }

    if (item.subItems && item.subItems.length > 0) {
      return (
        <parts.Sub key={`${item.label}-${index}`}>
          <parts.SubTrigger
            disabled={item.disabled}
            className={cn(
              "flex items-center gap-2 pr-2",
              item.variant === "danger" &&
                "text-destructive focus:text-destructive focus:bg-destructive/10",
            )}
          >
            {item.icon && (
              <span className="shrink-0">{resolveContextIcon(item.icon)}</span>
            )}
            {/* Without this the label wraps rather than widening the menu, which is
                how "Change Project Type" ended up stacked over three lines. */}
            <span className="whitespace-nowrap">{item.label}</span>
          </parts.SubTrigger>
          <parts.SubContent collisionPadding={8}>
            {item.subItems.map((subItem, subIndex) =>
              renderMenuItem(subItem, subIndex, parts),
            )}
          </parts.SubContent>
        </parts.Sub>
      );
    }

    return (
      <parts.Item
        key={`${item.label}-${index}`}
        disabled={item.disabled}
        onClick={() => {
          if (item.disabled || !item.onClick) return;
          item.onClick();
        }}
        className={cn(
          "flex items-center gap-2",
          item.variant === "danger" &&
            "text-destructive focus:text-destructive focus:bg-destructive/10",
        )}
      >
        {item.icon && (
          <span className="shrink-0">{resolveContextIcon(item.icon)}</span>
        )}
        <span className="flex-1 whitespace-nowrap">{item.label}</span>
        {item.checked && <Check className="ml-2 h-4 w-4 shrink-0" />}
      </parts.Item>
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
    const tableRow = (
      <TableRow
        key={rowKey(row)}
        data-mutating={mutating || undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onClick={onRowClick ? (event) => handleRowClick(event, row) : undefined}
        onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
        onMouseEnter={getRowHref ? () => handleRowMouseEnter(row) : undefined}
        className={cn(
          "transition-colors",
          mutating && "opacity-60 pointer-events-none",
          onRowClick &&
            "cursor-pointer hover:bg-elev-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
          getRowClassName?.(row),
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
                {rowMenuItems.map((item, index) => renderMenuItem(item, index, DROPDOWN_PARTS))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        ) : null}
      </TableRow>
    );

    if (!getContextMenuItems) return tableRow;

    // El trigger es la propia fila (`asChild`), asi que Radix escucha el
    // contextmenu donde se pulsa y mide contra el punto del cursor. El
    // contenido sale por un portal, de modo que no se cuela un div dentro del
    // tbody.
    return (
      // `modal={false}` a proposito: en modal Radix bloquea los punteros del
      // resto de la pagina mientras el menu esta abierto, asi que el siguiente
      // clic derecho sobre otra fila lo absorbe su capa y no llega a la fila.
      // Sin modal el menu abierto se cierra solo y el nuevo se abre donde se
      // pulso, que es lo que se espera de un menu contextual.
      <ContextMenu key={rowKey(row)} modal={false}>
        <ContextMenuTrigger asChild>{tableRow}</ContextMenuTrigger>
        <ContextMenuContent collisionPadding={8}>
          {rowMenuItems.map((item, index) => renderMenuItem(item, index, CONTEXT_PARTS))}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderMobileRow = (row: T) => {
    const mutating = isMutating?.(row) ?? false;
    const rowMenuItems = getContextMenuItems ? getContextMenuItems(row) : [];
    return (
      <article
        key={rowKey(row)}
        data-mutating={mutating || undefined}
        className={cn(
          "rounded-xl border border-line bg-elev-2 p-4 shadow-sm",
          mutating && "pointer-events-none opacity-60",
          getRowClassName?.(row),
        )}
      >
        <div className="flex items-start gap-3">
          {selection ? (
            <Checkbox
              checked={selection.selectedIds.has(rowKey(row))}
              onCheckedChange={() => handleToggleRow(row)}
              aria-label="Select row"
              className="mt-1"
            />
          ) : null}
          <div className="min-w-0 flex-1">{mobileRender?.(row)}</div>
          {getContextMenuItems ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Row actions"
                  className="-mr-2 -mt-2 h-8 w-8 shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {rowMenuItems.map((item, index) => renderMenuItem(item, index, DROPDOWN_PARTS))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <>
      {mobileRender ? (
        <div className="space-y-3 xl:hidden">
          {mobileSortableColumns.length > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Sort by</span>
              <div className="flex min-w-0 items-center gap-2">
                <Select
                  value={sortKey ?? "__default"}
                  onValueChange={(key) => {
                    setSortKey(key === "__default" ? null : key);
                    setSortDir("asc");
                  }}
                >
                  <SelectTrigger className="h-9 w-[min(12rem,55vw)] bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default">Default order</SelectItem>
                    {mobileSortableColumns.map((column) => (
                      <SelectItem key={String(column.key)} value={String(column.key)}>
                        {column.header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                  aria-label={sortDir === "asc" ? "Sort descending" : "Sort ascending"}
                  disabled={!sortKey}
                  onClick={() => setSortDir((dir) => dir === "asc" ? "desc" : "asc")}
                >
                  {sortDir === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </Button>
              </div>
            </div>
          ) : null}
          {/* Below xl the table is replaced by cards, so the loading state has to
              be replaced too — otherwise a phone got an empty page for the whole
              wait while the desktop got a skeleton. */}
          {showSkeleton
            ? Array.from({ length: Math.min(skeletonRows, 5) }).map((_, i) => (
                <article
                  key={`skeleton-card-${i}`}
                  className="skeleton-deferred space-y-2 rounded-xl border border-line bg-elev-2 p-4 shadow-sm"
                >
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </article>
              ))
            : isGrouped
            ? groups.map((group) => (
                <section key={group.key} aria-label={group.label}>
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.color ? (
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                    ) : null}
                    {group.label}
                    <span className="font-normal">{group.items.length}</span>
                  </h3>
                  <div className="space-y-3">{group.items.map(renderMobileRow)}</div>
                </section>
              ))
            : pagedData.map(renderMobileRow)}
        </div>
      ) : null}

      <section
        className={cn(
          "rounded-2xl bg-elev-2 shadow-sm overflow-x-auto",
          mobileRender && "hidden xl:block",
          className,
        )}
      >
        <Table style={minWidth ? { minWidth } : undefined}>
          <TableHeader className="bg-elev-3">
            <TableRow className="text-left font-display text-xs uppercase tracking-wide text-muted-foreground h-12 border-b border-line">
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
                    {/* nowrap: header labels are short and fixed, so wrapping one
                        ("Lead #", "Project Type") only ever buys a taller header
                        row — it never makes the table fit. */}
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
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
                  // `skeleton-deferred`: the rows take their space at once, so the
                  // table never resizes under the user, but the placeholders stay
                  // invisible for 200ms. A filter change the local API answers in
                  // 50ms therefore never flashes a skeleton, while a QuickBooks
                  // screen (8-30s) shows one immediately for all practical purposes.
                  <TableRow key={`skeleton-${i}`} className="skeleton-deferred">
                    {selection ? (
                      <TableCell className="w-10 px-4 py-3">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                      </TableCell>
                    ) : null}
                    {columns.map((col) => (
                      // The cell inherits the real column's width class, so the
                      // skeleton's geometry is the loaded table's by construction
                      // and cannot drift away from it.
                      <TableCell key={String(col.key)} className={cn("px-4 py-3", col.className)}>
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
      {/* elev-3 is also the data-row hover surface, so the fill alone does not
          mark a group break: the top rule does. Not elev-4 either — that is the
          selected-row surface. */}
      <TableRow className="border-t border-line-strong bg-elev-3 hover:bg-elev-3">
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

/**
 * There is deliberately no `DefaultTableLoading` any more. Every list used to
 * pass one as `loadingState`, and because `loadingState` short-circuits the
 * render it replaced the whole table -- columns and all -- with a centred
 * spinner in a box. That is what made the wait look broken: the spinner has
 * none of the table's geometry, so the moment the rows arrived the page jumped
 * from a 150px box to a full-height table. Leaving `loadingState` unset lets
 * the skeleton below run instead, and it is built from the real `columns`, so
 * it matches by construction. `loadingState` itself stays for the rare screen
 * whose loading state genuinely is not a table.
 */
