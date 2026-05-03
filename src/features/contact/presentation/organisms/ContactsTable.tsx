"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import { useContactsTableColumns, type UseContactsTableLogicReturn } from "../hooks";
import type { ContactGroupBy } from "../hooks/table/useContactsTableLogic";
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
import { Loader, Users, Edit, Trash, FileText, ChevronUp, ChevronDown, ChevronsUpDown, type LucideIcon } from "lucide-react";
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

function groupContacts(contacts: Contact[], groupBy: ContactGroupBy): Array<{ key: string; label: string; color?: string; items: Contact[] }> {
  if (groupBy === "none") return [{ key: "all", label: "", items: contacts }];

  const map = new Map<string, Contact[]>();
  for (const c of contacts) {
    let key: string;
    if (groupBy === "customer") key = c.isCustomer ? "Yes" : "No";
    else if (groupBy === "client") key = c.isClient ? "Yes" : "No";
    else key = (c.company as any)?.name ?? "No Company";
    const existing = map.get(key) ?? [];
    existing.push(c);
    map.set(key, existing);
  }

  const entries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([key, items]) => ({ key, label: key, items }));
}

export interface ContactsTableProps {
  tableLogic?: UseContactsTableLogicReturn;
  companies?: Company[];
  isLoading?: boolean;
  contacts?: Contact[];
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  groupBy?: ContactGroupBy;
  /** When enabled and items > pageSize, shows pagination controls below the table. */
  pagination?: { enabled?: boolean };
}

export function ContactsTable({
  tableLogic,
  companies = [],
  isLoading = false,
  contacts,
  onEdit,
  onDelete,
  groupBy = "none",
  pagination,
}: ContactsTableProps) {
  const router = useRouter();
  const rows = tableLogic?.rows ?? contacts ?? [];
  const onOpenNotesModal = tableLogic?.onOpenNotesModal ?? (() => {});
  const onOpenCompanyModal = tableLogic?.onOpenCompanyModal ?? (() => {});
  const isGrouped = groupBy !== "none";

  const columns = useContactsTableColumns({
    companies,
    onOpenCompanyModal,
    onOpenNotesModal,
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
    () => sortRows(rows, columns, sortKey, sortDir),
    [rows, columns, sortKey, sortDir]
  );

  const groups = React.useMemo(() => groupContacts(sortedRows, groupBy), [sortedRows, groupBy]);

  const resolvedGetContextMenuItems = React.useMemo<((contact: Contact) => Array<{label: string; onClick: () => void; icon?: string | React.ReactNode; variant?: "default" | "danger"; disabled?: boolean}>) | undefined>(() => {
    if (tableLogic?.getContextMenuItems) {
      return (contact: Contact) => {
        const items = tableLogic.getContextMenuItems(contact);
        return items.map(item => ({
          label: item.label,
          onClick: item.onClick,
          icon: item.icon,
          variant: item.variant,
          disabled: item.disabled,
        }));
      };
    }

    if (onEdit || onDelete) {
      return (contact: Contact) => {
        const items: Array<{label: string; onClick: () => void; icon?: string; variant?: "default" | "danger"}> = [];
        if (onEdit) items.push({ label: "Edit", onClick: () => onEdit(contact), icon: "lucide:edit" });
        if (onDelete) items.push({ label: "Delete", onClick: () => onDelete(contact), variant: "danger", icon: "lucide:trash" });
        return items;
      };
    }

    return undefined;
  }, [onDelete, onEdit, tableLogic?.getContextMenuItems]);

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
  const [selectedItem, setSelectedItem] = React.useState<Contact | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, item: Contact) => {
      if (!resolvedGetContextMenuItems) return;
      event.preventDefault();
      setSelectedItem(item);
      setMenuPosition({ x: event.clientX, y: event.clientY });
      setContextMenuOpen(true);
    },
    [resolvedGetContextMenuItems]
  );

  const handleRowClick = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, contact: Contact) => {
      if (event.button === 2) return;
      const target = event.target as HTMLElement;
      if (target.closest('button, a, [role="button"], [role="menuitem"]')) return;
      if (contextMenuOpen) return;
      if (contact.id) router.push(`/contact/${contact.id}`);
    },
    [router, contextMenuOpen]
  );

  const menuItems = React.useMemo(() => {
    if (!selectedItem || !resolvedGetContextMenuItems) return [];
    return resolvedGetContextMenuItems(selectedItem);
  }, [selectedItem, resolvedGetContextMenuItems]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
        <Loader className="size-12 text-muted-foreground/50 mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-foreground">Loading contacts…</h3>
        <p className="text-sm text-muted-foreground mt-1">Please wait while we load your contacts.</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
        <Users className="size-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No contacts found.</h3>
        <p className="text-sm text-muted-foreground mt-1">Use the button above to create a new contact.</p>
      </div>
    );
  }

  const renderRow = (item: Contact) => (
    <TableRow
      key={item.id ?? 0}
      onContextMenu={resolvedGetContextMenuItems ? (event) => handleRowContextMenu(event, item) : undefined}
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
                        style={group.color ? { color: group.color } : undefined}
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
                  {typeof item.icon === "string" ? (
                    iconMap[item.icon] ? (() => {
                      const IconComponent = iconMap[item.icon];
                      return <IconComponent className="size-4" />;
                    })() : null
                  ) : (item.icon)}
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
