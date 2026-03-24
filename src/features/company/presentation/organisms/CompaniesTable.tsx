"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Company } from "../../domain/models";
import { useCompaniesTableColumns } from "../hooks";
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
import { Loader, Building, Edit, Trash, FileText, type LucideIcon } from "lucide-react";

// Mapeo de iconos de Iconify a lucide-react
const iconMap: Record<string, LucideIcon> = {
  "lucide:edit": Edit,
  "lucide:trash-2": Trash,
  "lucide:trash": Trash,
  "lucide:file-text": FileText,
};
import { cn } from "@/lib/utils";
import { usePagination } from "@/common/hooks/table/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";

export interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  services?: Array<{ id: number; name: string; color?: string | null }>;
  getContextMenuItems: (row: Company) => Array<{label: string; onClick: () => void; icon?: string | React.ReactNode; variant?: "default" | "danger"; disabled?: boolean}>;
  onOpenNotesModal?: (company: Company) => void;
  /** When enabled and items > pageSize, shows pagination controls below the table. */
  pagination?: { enabled?: boolean };
}

export function CompaniesTable({
  companies,
  isLoading,
  services = [],
  getContextMenuItems,
  onOpenNotesModal,
  pagination,
}: CompaniesTableProps) {
  const router = useRouter();
  const columns = useCompaniesTableColumns({
    services,
    onOpenNotesModal: onOpenNotesModal || (() => {}),
  });

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
    data: companies,
    enabled: pagination?.enabled ?? false,
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
      if (event.button === 2) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.closest('button, a, [role="button"], [role="menuitem"]')) {
        return;
      }

      if (contextMenuOpen) {
        return;
      }

      if (company.id) {
        router.push(`/company/${company.id}`);
      }
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

  return (
    <>
      <section className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="text-left text-xs uppercase tracking-wide text-muted-foreground h-12 border-b border-border">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn("px-4 py-3 h-full align-middle", column.className)}
                >
                  <span>{column.header}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {pagedData.map((item) => (
              <TableRow
                key={item.id ?? 0}
                onContextMenu={(event) => handleRowContextMenu(event, item)}
                onClick={(event) => handleRowClick(event, item)}
                className="cursor-pointer hover:bg-accent/30 transition-colors"
              >
                {columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    className={cn("px-4 py-3", column.className)}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key as string]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {isPaginated && (
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
            left: menuPosition.x,
            top: menuPosition.y,
          }}
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
              className={
                item.variant === "danger"
                  ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                  : undefined
              }
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
