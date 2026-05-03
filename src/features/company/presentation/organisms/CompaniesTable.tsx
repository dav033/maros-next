"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Company } from "../../domain/models";
import { useCompaniesTableColumns } from "../hooks";
import type { CompanyGroupBy } from "../hooks/table/useCompaniesTableLogic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Loader, Building, Edit, Trash, FileText, ChevronUp, ChevronDown, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePagination } from "@/common/hooks/table/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";

const iconMap: Record<string, LucideIcon> = {
  "lucide:edit": Edit,
  "lucide:trash-2": Trash,
  "lucide:trash": Trash,
  "lucide:file-text": FileText,
};

type SortDir = "asc" | "desc";

function naturalCompare(a: string | number | null | undefined, b: string | number | null | undefined): number {
  const sa = String(a ?? "");
  const sb = String(b ?? "");
  return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: "base" });
}

function sortRows<T>(rows: T[], columns: import("@/types/table").SimpleTableColumn<T>[], sortKey: string | null, sortDir: SortDir): T[] {
  if (!sortKey) return rows;
  const col = columns.find((c) => String(c.key) === sortKey);
  if (!col?.sortValue) return rows;
  const dir = sortDir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => dir * naturalCompare(col.sortValue!(a), col.sortValue!(b)));
}

const TYPE_LABELS: Record<string, string> = {
  DESIGN: "Design",
  HOA: "HOA",
  GENERAL_CONTRACTOR: "General Contractor",
  SUPPLIER: "Supplier",
  SUBCONTRACTOR: "Subcontractor",
  OTHER: "Other",
};

function groupCompanies(companies: Company[], groupBy: CompanyGroupBy): Array<{ key: string; label: string; items: Company[] }> {
  if (groupBy === "none") return [{ key: "all", label: "", items: companies }];

  const map = new Map<string, Company[]>();
  for (const c of companies) {
    let key: string;
    if (groupBy === "type") key = c.type ?? "OTHER";
    else if (groupBy === "customer") key = c.isCustomer ? "Yes" : "No";
    else key = c.isClient ? "Yes" : "No";
    const existing = map.get(key) ?? [];
    existing.push(c);
    map.set(key, existing);
  }

  const entries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([key, items]) => ({
    key,
    label: groupBy === "type" ? (TYPE_LABELS[key] ?? key) : key,
    items,
  }));
}

export interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  services?: Array<{ id: number; name: string; color?: string | null }>;
  getContextMenuItems: (row: Company) => Array<{label: string; onClick: () => void; icon?: string | React.ReactNode; variant?: "default" | "danger"; disabled?: boolean}>;
  onOpenNotesModal?: (company: Company) => void;
  groupBy?: CompanyGroupBy;
  /** When enabled and items > pageSize, shows pagination controls below the table. */
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
  const isGrouped = groupBy !== "none";

  const columns = useCompaniesTableColumns({
    services,
    onOpenNotesModal: onOpenNotesModal || (() => {}),
  });

  const [sortKey, setSortKey] = React.useState<string | null>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  const handleSortClick = React.useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }, [sortKey]);

  const sortedRows = React.useMemo(
    () => sortRows(companies, columns, sortKey, sortDir),
    [companies, columns, sortKey, sortDir]
  );

  const groups = React.useMemo(() => groupCompanies(sortedRows, groupBy), [sortedRows, groupBy]);

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
    data: sortedRows,
    enabled: !isGrouped && (pagination?.enabled ?? false),
  });

  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Company | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, item: Company) => {
      event.preventDefault();
      setSelectedItem(item);
      setMenuPosition({ x: event.clientX, y: event.clientY });
      setContextMenuOpen(true);
    },
    []
  );

  const handleRowClick = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, company: Company) => {
      if (event.button === 2) return;
      const target = event.target as HTMLElement;
      if (target.closest('button, a, [role="button"], [role="menuitem"]')) return;
      if (contextMenuOpen) return;
      if (company.id) router.push(`/company/${company.id}`);
    },
    [router, contextMenuOpen]
  );

  const menuItems = React.useMemo(() => {
    if (!selectedItem) return [];
    return getContextMenuItems(selectedItem);
  }, [selectedItem, getContextMenuItems]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
        <Loader className="size-12 text-muted-foreground/50 mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-foreground">Loading companies…</h3>
        <p className="text-sm text-muted-foreground mt-1">Please wait while we load your companies.</p>
      </div>
    );
  }

  if (!companies.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
        <Building className="size-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No companies found.</h3>
        <p className="text-sm text-muted-foreground mt-1">Use the button above to create a new company.</p>
      </div>
    );
  }

  const renderRow = (item: Company) => (
    <TableRow
      key={item.id ?? 0}
      onContextMenu={(event) => handleRowContextMenu(event, item)}
      onClick={(event) => handleRowClick(event, item)}
      className="cursor-pointer hover:bg-accent/30 transition-colors"
    >
      {columns.map((column) => (
        <TableCell key={String(column.key)} className={cn("px-4 py-3", column.className)}>
          {column.render ? column.render(item) : (item as any)[column.key as string]}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <>
      <section className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="text-left text-xs uppercase tracking-wide text-muted-foreground h-12 border-b border-border">
              {columns.map((column) => {
                const key = String(column.key);
                const isActive = sortKey === key;
                return (
                  <TableHead
                    key={key}
                    className={cn("px-4 py-3 h-full align-middle", column.className, column.sortable && "cursor-pointer select-none")}
                    onClick={column.sortable ? () => handleSortClick(key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        isActive
                          ? sortDir === "asc"
                            ? <ChevronUp className="h-3 w-3 text-foreground" />
                            : <ChevronDown className="h-3 w-3 text-foreground" />
                          : <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {isGrouped
              ? groups.map((group) => (
                  <React.Fragment key={group.key}>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell
                        colSpan={columns.length}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                      >
                        {group.label}
                        <span className="ml-2 font-normal text-muted-foreground">({group.items.length})</span>
                      </TableCell>
                    </TableRow>
                    {group.items.map(renderRow)}
                  </React.Fragment>
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
          style={{ position: "fixed", left: menuPosition.x, top: menuPosition.y }}
        >
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setContextMenuOpen(false);
                }
              }}
              disabled={item.disabled}
              className={item.variant === "danger" ? "text-destructive focus:text-destructive focus:bg-destructive/10" : undefined}
            >
              {item.icon && (
                <span className="mr-2">
                  {typeof item.icon === "string" && iconMap[item.icon] ? (
                    (() => {
                      const IconComponent = iconMap[item.icon];
                      return <IconComponent className="size-4" />;
                    })()
                  ) : typeof item.icon === "string" ? null : (
                    item.icon
                  )}
                </span>
              )}
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
