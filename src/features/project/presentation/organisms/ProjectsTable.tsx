"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/project/domain";
import { useProjectsTableColumns } from "../hooks/table/useProjectsTableColumns";
import type { UseProjectsTableLogicReturn } from "../hooks/table/useProjectsTableLogic";
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
import { Loader, FolderX, Edit, Trash, FileText, StickyNote, DollarSign, type LucideIcon } from "lucide-react";

// Mapeo de iconos de Iconify a lucide-react
const iconMap: Record<string, LucideIcon> = {
  "lucide:edit": Edit,
  "lucide:trash-2": Trash,
  "lucide:trash": Trash,
  "lucide:file-text": FileText,
  "lucide:sticky-note": StickyNote,
  "lucide:dollar-sign": DollarSign,
  "mdi:note-text": StickyNote,
  "mdi:cash-multiple": DollarSign,
};
import { cn } from "@/lib/utils";
import { usePagination } from "@/common/hooks/table/usePagination";
import { TablePagination } from "@/components/shared/TablePagination";

export interface ProjectsTableProps {
  tableLogic?: UseProjectsTableLogicReturn;
  isLoading?: boolean;
  projects?: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onOpenNotesModal?: (project: Project) => void;
  /** When enabled and items > pageSize, shows pagination controls below the table. */
  pagination?: { enabled?: boolean };
}

export function ProjectsTable({
  tableLogic,
  isLoading = false,
  projects,
  onEdit,
  onDelete,
  onOpenNotesModal,
  pagination,
}: ProjectsTableProps) {
  const router = useRouter();
  const rows = tableLogic?.rows ?? projects ?? [];
  const columns = useProjectsTableColumns({ onOpenNotesModal });

  const resolvedGetContextMenuItems = React.useMemo<((project: Project) => Array<{label: string; onClick: () => void; icon?: string; variant?: "default" | "danger"; disabled?: boolean}>) | undefined>(() => {
    if (tableLogic?.getContextMenuItems) {
      return (project: Project) => {
        const items = tableLogic.getContextMenuItems(project);
        return items.map(item => ({
          label: item.label,
          onClick: item.onClick,
          icon: typeof item.icon === "string" ? item.icon : undefined,
          variant: item.variant,
          disabled: item.disabled,
        }));
      };
    }

    if (onEdit || onDelete) {
      return (project: Project) => {
        const items: Array<{label: string; onClick: () => void; icon?: string; variant?: "default" | "danger"; disabled?: boolean}> = [];
        if (onEdit) {
          items.push({
            label: "Edit",
            onClick: () => onEdit(project),
            icon: "lucide:edit",
          });
        }
        if (onDelete) {
          items.push({
            label: "Delete",
            onClick: () => onDelete(project),
            variant: "danger" as const,
            icon: "lucide:trash",
          });
        }
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
    data: rows,
    enabled: pagination?.enabled ?? false,
  });

  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Project | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, item: Project) => {
      if (!resolvedGetContextMenuItems) return;
      event.preventDefault();
      setSelectedItem(item);
      setMenuPosition({ x: event.clientX, y: event.clientY });
      setContextMenuOpen(true);
    },
    [resolvedGetContextMenuItems]
  );

  const handleRowClick = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, project: Project) => {
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

      if (project.id) {
        router.push(`/project/${project.id}`);
      }
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
        <h3 className="text-lg font-medium text-foreground">Loading projects…</h3>
        <p className="text-sm text-muted-foreground mt-1">Please wait while we load your projects.</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
        <FolderX className="size-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No projects found</h3>
        <p className="text-sm text-muted-foreground mt-1">Get started by creating a new project.</p>
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
                key={item.id}
                onContextMenu={resolvedGetContextMenuItems ? (event) => handleRowContextMenu(event, item) : undefined}
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
                  {typeof item.icon === "string" ? (
                    iconMap[item.icon] ? (
                      (() => {
                        const IconComponent = iconMap[item.icon];
                        return <IconComponent className="size-4" />;
                      })()
                    ) : null
                  ) : (
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
