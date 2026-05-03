"use client";

import { useMemo, useState } from "react";
import { useEntityTableLogic, useTableWithSearch } from "@/common/hooks";

import type { Contact } from "@/contact/domain";
import { useContactsApp } from "@/di";
import { deleteContact } from "@/contact/application";
import { contactsSearchConfig } from "../../search/contactsSearchConfig";

export type ContactGroupBy = "none" | "customer" | "client" | "company";

interface UseContactsTableLogicProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => void;
  onOpenNotesModal?: (contact: Contact) => void;
  onOpenCompanyModal?: (company: any) => void;
}

export interface UseContactsTableLogicReturn {
  rows: Contact[];
  totalCount: number;
  filteredCount: number;
  searchState: {
    searchQuery: string;
    searchField: string;
    setSearchQuery: (q: string) => void;
    setSearchField: (f: string) => void;
  };
  filterState: {
    customerFilter: boolean | "all";
    setCustomerFilter: (v: boolean | "all") => void;
    clientFilter: boolean | "all";
    setClientFilter: (v: boolean | "all") => void;
    groupBy: ContactGroupBy;
    setGroupBy: (v: ContactGroupBy) => void;
  };
  deleteModalProps: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemToDelete: Contact | null;
    isDeleting: boolean;
    error: string | null;
  };
  getContextMenuItems: (contact: Contact) => Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
    icon?: string | React.ReactNode;
    disabled?: boolean;
  }>;
  onOpenNotesModal?: (contact: Contact) => void;
  onOpenCompanyModal?: (company: any) => void;
}

export function useContactsTableLogic({
  contacts,
  onEdit,
  onDelete,
  onOpenNotesModal,
  onOpenCompanyModal,
}: UseContactsTableLogicProps): UseContactsTableLogicReturn {
  const app = useContactsApp();

  const [customerFilter, setCustomerFilter] = useState<boolean | "all">("all");
  const [clientFilter, setClientFilter] = useState<boolean | "all">("all");
  const [groupBy, setGroupBy] = useState<ContactGroupBy>("none");

  const {
    rows: localContacts,
    deleteModalProps,
    getContextMenuItems,
  } = useEntityTableLogic<Contact, number>({
    items: contacts,
    getId: (c) => (typeof c.id === "number" ? c.id : 0),
    onDelete: async (id) => {
      await deleteContact(app, id);
      onDelete(id);
    },
    onEdit,
    buildExtraMenuItems: (contact) => {
      const items = [];

      if (onOpenNotesModal) {
        items.push({
          label: "View Notes",
          onClick: () => onOpenNotesModal(contact),
          icon: "lucide:file-text",
        });
      }

      if (onOpenCompanyModal && contact.company) {
        items.push({
          label: "View Company",
          onClick: () => onOpenCompanyModal(contact.company),
          icon: "lucide:building-2",
          disabled: !contact.company,
        });
      }

      return items;
    },
  });

  const {
    filteredData: searchFiltered,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
  } = useTableWithSearch<Contact>({
    data: localContacts,
    searchableFields: contactsSearchConfig.fields.map((f) => f.key),
    defaultSearchField: contactsSearchConfig.defaultField,
    normalize: contactsSearchConfig.normalize,
  });

  const filteredContacts = useMemo(() => {
    let result = searchFiltered;
    if (customerFilter !== "all") result = result.filter((c) => c.isCustomer === customerFilter);
    if (clientFilter !== "all") result = result.filter((c) => c.isClient === clientFilter);
    return result;
  }, [searchFiltered, customerFilter, clientFilter]);

  return {
    rows: filteredContacts,
    totalCount,
    filteredCount: filteredContacts.length,
    searchState: {
      searchQuery,
      searchField,
      setSearchQuery,
      setSearchField,
    },
    filterState: {
      customerFilter,
      setCustomerFilter,
      clientFilter,
      setClientFilter,
      groupBy,
      setGroupBy,
    },
    deleteModalProps,
    getContextMenuItems,
    onOpenNotesModal,
    onOpenCompanyModal,
  };
}
