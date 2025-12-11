"use client";

import * as React from "react";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import {
  ContextMenuTable,
  type ContextMenuTableItem,
} from "@dav033/dav-components";
import { useContactsTableColumns, type UseContactsTableLogicReturn } from "../hooks";

export interface ContactsTableProps {
  tableLogic?: UseContactsTableLogicReturn;
  companies?: Company[];
  isLoading?: boolean;
  // Props alternativos cuando no se usa tableLogic
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
  const rows = tableLogic?.rows ?? contacts ?? [];
  const resolvedGetContextMenuItems = React.useMemo<((contact: Contact) => ContextMenuTableItem[]) | undefined>(() => {
    if (tableLogic?.getContextMenuItems) {
      return tableLogic.getContextMenuItems;
    }

    if (onEdit || onDelete) {
      return (contact: Contact) => {
        const items = [];
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
  const onOpenNotesModal = tableLogic?.onOpenNotesModal ?? (() => {});
  const onOpenCompanyModal = tableLogic?.onOpenCompanyModal ?? (() => {});

  const columns = useContactsTableColumns({
    companies,
    onOpenCompanyModal: onOpenCompanyModal,
    onOpenNotesModal: onOpenNotesModal,
  });

  return (
    <ContextMenuTable<Contact>
      data={rows}
      columns={columns}
      rowKey={(contact) => contact.id ?? 0}
      getContextMenuItems={resolvedGetContextMenuItems}
      isLoading={isLoading}
      loadingState={{
        iconName: "lucide:loader-2",
        title: "Loading contacts…",
        subtitle: "Please wait while we load your contacts.",
      }}
      emptyState={{
        iconName: "lucide:users",
        title: "No contacts found.",
        subtitle: "Use the button above to create a new contact.",
      }}
    />
  );
}
