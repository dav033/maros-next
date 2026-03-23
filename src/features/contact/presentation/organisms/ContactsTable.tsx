"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import { useContactsTableColumns, type UseContactsTableLogicReturn } from "../hooks";
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
import { Loader, Users, Edit, Trash, FileText, type LucideIcon } from "lucide-react";

// Mapeo de iconos de Iconify a lucide-react
const iconMap: Record<string, LucideIcon> = {
  "lucide:edit": Edit,
  "lucide:trash-2": Trash,
  "lucide:trash": Trash,
  "lucide:file-text": FileText,
};
import { cn } from "@/lib/utils";

export interface ContactsTableProps {
  tableLogic?: UseContactsTableLogicReturn;
  companies?: Company[];
  isLoading?: boolean;
  contacts?: Contact[];
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export function ContactsTable({
  tableLogic,
  companies = [],
  isLoading = false,
  contacts,
  onEdit,
  onDelete,
}: ContactsTableProps) {
  const router = useRouter();
  const rows = tableLogic?.rows ?? contacts ?? [];
  const onOpenNotesModal = tableLogic?.onOpenNotesModal ?? (() => {});
  const onOpenCompanyModal = tableLogic?.onOpenCompanyModal ?? (() => {});

  const columns = useContactsTableColumns({
    companies,
    onOpenCompanyModal: onOpenCompanyModal,
    onOpenNotesModal: onOpenNotesModal,
  });

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
        if (onEdit) {
          items.push({
            label: "Edit",
            onClick: () => onEdit(contact),
            icon: "lucide:edit",
          });
        }
        if (onDelete) {
          items.push({
            label: "Delete",
            onClick: () => onDelete(contact),
            variant: "danger" as const,
            icon: "lucide:trash",
          });
        }
        return items;
      };
    }

    return undefined;
  }, [onDelete, onEdit, tableLogic?.getContextMenuItems]);

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
      // No navegar si es click derecho
      if (event.button === 2) {
        return;
      }
      
      // No navegar si se está haciendo click en un elemento interactivo
      const target = event.target as HTMLElement;
      if (target.closest('button, a, [role="button"], [role="menuitem"]')) {
        return;
      }
      
      // No navegar si se está abriendo el context menu
      if (contextMenuOpen) {
        return;
      }
      
      // Solo navegar si tiene ID
      if (contact.id) {
        router.push(`/contact/${contact.id}`);
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
            {rows.map((item) => (
              <TableRow
                key={item.id ?? 0}
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
