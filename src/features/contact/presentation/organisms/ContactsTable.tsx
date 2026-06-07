"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import {
  DefaultTableLoading,
  EntityTable,
  type EntityContextMenuItem,
  type EntityTableGroupBy,
} from "@/components/shared";
import type { Company } from "@/company";
import type { Contact } from "@/contact";

import { useContactsTableColumns, type UseContactsTableLogicReturn } from "../hooks";
import type { ContactGroupBy } from "../hooks/table/useContactsTableLogic";

function buildGroupBy(mode: ContactGroupBy): EntityTableGroupBy<Contact> | undefined {
  if (mode === "none") return undefined;
  if (mode === "customer") {
    return {
      getKey: (c) => (c.isCustomer ? "Yes" : "No"),
      getLabel: (key) => key,
    };
  }
  if (mode === "client") {
    return {
      getKey: (c) => (c.isClient ? "Yes" : "No"),
      getLabel: (key) => key,
    };
  }
  return {
    getKey: (c) => c.company?.name ?? "No Company",
    getLabel: (key) => key,
  };
}

export interface ContactsTableProps {
  tableLogic?: UseContactsTableLogicReturn;
  companies?: Company[];
  isLoading?: boolean;
  contacts?: Contact[];
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  groupBy?: ContactGroupBy;
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

  const columns = useContactsTableColumns({
    companies,
    onOpenCompanyModal,
    onOpenNotesModal,
  });

  const getContextMenuItems = useMemo<
    ((row: Contact) => EntityContextMenuItem[]) | undefined
  >(() => {
    if (tableLogic?.getContextMenuItems) {
      return (row: Contact) =>
        tableLogic.getContextMenuItems(row).map((item) => ({
          label: item.label,
          onClick: item.onClick,
          icon: item.icon,
          variant: item.variant,
          disabled: item.disabled,
        }));
    }
    if (onEdit || onDelete) {
      return (row: Contact) => {
        const items: EntityContextMenuItem[] = [];
        if (onEdit) {
          items.push({ label: "Edit", onClick: () => onEdit(row), icon: "lucide:edit" });
        }
        if (onDelete) {
          items.push({
            label: "Delete",
            onClick: () => onDelete(row),
            variant: "danger",
            icon: "lucide:trash",
          });
        }
        return items;
      };
    }
    return undefined;
  }, [tableLogic, onEdit, onDelete]);

  return (
    <EntityTable<Contact>
      data={rows}
      columns={columns}
      rowKey={(c) => c.id ?? 0}
      isLoading={isLoading}
      getContextMenuItems={getContextMenuItems}
      onRowClick={(c) => c.id && router.push(`/contact/${c.id}`)}
      getRowHref={(c) => (c.id ? `/contact/${c.id}` : undefined)}
      groupBy={buildGroupBy(groupBy)}
      paginated={pagination?.enabled}
      defaultSort={{ key: "name", dir: "asc" }}
      loadingState={<DefaultTableLoading label="Loading contacts…" />}
      emptyState={
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/40 p-8 text-center">
          <Users className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No contacts found.</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Use the button above to create a new contact.
          </p>
        </div>
      }
    />
  );
}
